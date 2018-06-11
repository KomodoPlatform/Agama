const async = require('async');
const Promise = require('bluebird');

// TODO: add z -> pub, pub -> z flag for zcash forks

module.exports = (shepherd) => {
  shepherd.sortTransactions = (transactions, sortBy) => {
    return transactions.sort((b, a) => {
      if (a[sortBy ? sortBy : 'height'] < b[sortBy ? sortBy : 'height']) {
        return -1;
      }

      if (a[sortBy ? sortBy : 'height'] > b[sortBy ? sortBy : 'height']) {
        return 1;
      }

      return 0;
    });
  }

  shepherd.getTransaction = (txid, network, ecl) => {
    return new Promise((resolve, reject) => {
      if (!shepherd.electrumCache[network]) {
        shepherd.electrumCache[network] = {};
      }
      if (!shepherd.electrumCache[network].tx) {
        shepherd.electrumCache[network]['tx'] = {};
      }

      if (!shepherd.electrumCache[network].tx[txid]) {
        shepherd.log(`electrum raw input tx ${txid}`, true);

        ecl.blockchainTransactionGet(txid)
        .then((_rawtxJSON) => {
          shepherd.electrumCache[network].tx[txid] = _rawtxJSON;
          resolve(_rawtxJSON);
        });
      } else {
        shepherd.log(`electrum cached raw input tx ${txid}`, true);
        resolve(shepherd.electrumCache[network].tx[txid]);
      }
    });
  }

  shepherd.getBlockHeader = (height, network, ecl) => {
    return new Promise((resolve, reject) => {
      if (!shepherd.electrumCache[network]) {
        shepherd.electrumCache[network] = {};
      }
      if (!shepherd.electrumCache[network].blockHeader) {
        shepherd.electrumCache[network]['blockHeader'] = {};
      }

      if (!shepherd.electrumCache[network].blockHeader[height]) {
        shepherd.log(`electrum raw block ${height}`, true);

        ecl.blockchainBlockGetHeader(height)
        .then((_rawtxJSON) => {
          shepherd.electrumCache[network].blockHeader[height] = _rawtxJSON;
          resolve(_rawtxJSON);
        });
      } else {
        shepherd.log(`electrum cached raw block ${height}`, true);
        resolve(shepherd.electrumCache[network].blockHeader[height]);
      }
    });
  }

  shepherd.get('/electrum/listtransactions', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      shepherd.listtransactions({
        network: req.query.network,
        coin: req.query.coin,
        address: req.query.address,
        kv: req.query.kv,
        maxlength: req.query.maxlength,
        full: req.query.full,
      })
      .then((txhistory) => {
        res.end(JSON.stringify(txhistory));
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.listtransactions = (config, options) => {
    return new Promise((resolve, reject) => {
      const network = config.network || shepherd.findNetworkObj(config.coin);
      const ecl = shepherd.ecl(network);
      const _address = config.address;
      const isKv = config.kv;
      const _maxlength = isKv ? 10 : config.maxlength;

      shepherd.log('electrum listtransactions ==>', true);

      if (!config.full ||
          ecl.insight) {
        ecl.connect();
        ecl.blockchainAddressGetHistory(_address)
        .then((json) => {
          ecl.close();
          shepherd.log(json, true);

          json = shepherd.sortTransactions(json, 'timestamp');

          resolve({
            msg: 'success',
            result: json,
          });
        });
      } else {
        // !expensive call!
        // TODO: limit e.g. 1-10, 10-20 etc
        const MAX_TX = _maxlength || 10;
        ecl.connect();

        ecl.blockchainNumblocksSubscribe()
        .then((currentHeight) => {
          if (currentHeight &&
              Number(currentHeight) > 0) {
            ecl.blockchainAddressGetHistory(_address)
            .then((json) => {
              if (json &&
                  json.length) {
                let _rawtx = [];

                json = shepherd.sortTransactions(json);
                json = json.length > MAX_TX ? json.slice(0, MAX_TX) : json;

                shepherd.log(json.length, true);
                let index = 0;

                // callback hell, use await?
                async.eachOfSeries(json, (transaction, ind, callback) => {
                  shepherd.getBlockHeader(transaction.height, network, ecl)
                  .then((blockInfo) => {
                    if (blockInfo &&
                        blockInfo.timestamp) {
                      shepherd.getTransaction(transaction['tx_hash'], network, ecl)
                      .then((_rawtxJSON) => {
                        shepherd.log('electrum gettransaction ==>', true);
                        shepherd.log((index + ' | ' + (_rawtxJSON.length - 1)), true);
                        // shepherd.log(_rawtxJSON, true);

                        // decode tx
                        const _network = shepherd.getNetworkData(network);
                        const decodedTx = shepherd.electrumJSTxDecoder(_rawtxJSON, network, _network);

                        let txInputs = [];
                        let opreturn = false;

                        shepherd.log(`decodedtx network ${network}`, true);

                        shepherd.log('decodedtx =>', true);
                        // shepherd.log(decodedTx.outputs, true);

                        let index2 = 0;

                        if (decodedTx &&
                            decodedTx.outputs &&
                            decodedTx.outputs.length) {
                          for (let i = 0; i < decodedTx.outputs.length; i++) {
                            if (decodedTx.outputs[i].scriptPubKey.type === 'nulldata') {
                              if (isKv) {
                                opreturn = {
                                  kvHex: decodedTx.outputs[i].scriptPubKey.hex,
                                  kvAsm: decodedTx.outputs[i].scriptPubKey.asm,
                                  kvDecoded: shepherd.kvDecode(decodedTx.outputs[i].scriptPubKey.asm.substr(10, decodedTx.outputs[i].scriptPubKey.asm.length), true),
                                };
                              } else {
                                opreturn = shepherd.hex2str(decodedTx.outputs[i].scriptPubKey.hex);
                              }
                            }
                          }
                        }

                        if (decodedTx &&
                            decodedTx.inputs &&
                            decodedTx.inputs.length) {
                          async.eachOfSeries(decodedTx.inputs, (_decodedInput, ind2, callback2) => {
                            const checkLoop = () => {
                              index2++;

                              if (index2 === decodedTx.inputs.length ||
                                  index2 === shepherd.appConfig.spv.maxVinParseLimit) {
                                shepherd.log(`tx history decode inputs ${decodedTx.inputs.length} | ${index2} => main callback`, true);
                                const _parsedTx = {
                                  network: decodedTx.network,
                                  format: decodedTx.format,
                                  inputs: txInputs,
                                  outputs: decodedTx.outputs,
                                  height: transaction.height,
                                  timestamp: Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp,
                                  confirmations: Number(transaction.height) === 0 || Number(transaction.height) === -1 ? 0 : currentHeight - transaction.height,
                                };

                                const formattedTx = shepherd.parseTransactionAddresses(_parsedTx, _address, network);

                                if (formattedTx.type) {
                                  formattedTx.height = transaction.height;
                                  formattedTx.blocktime = Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp;
                                  formattedTx.timereceived = Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timereceived;
                                  formattedTx.hex = _rawtxJSON;
                                  formattedTx.inputs = decodedTx.inputs;
                                  formattedTx.outputs = decodedTx.outputs;
                                  formattedTx.locktime = decodedTx.format.locktime;
                                  formattedTx.vinLen = decodedTx.inputs.length;
                                  formattedTx.vinMaxLen = shepherd.appConfig.spv.maxVinParseLimit;
                                  formattedTx.opreturn = opreturn;
                                  _rawtx.push(formattedTx);
                                } else {
                                  formattedTx[0].height = transaction.height;
                                  formattedTx[0].blocktime = Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp;
                                  formattedTx[0].timereceived = Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timereceived;
                                  formattedTx[0].hex = _rawtxJSON;
                                  formattedTx[0].inputs = decodedTx.inputs;
                                  formattedTx[0].outputs = decodedTx.outputs;
                                  formattedTx[0].locktime = decodedTx.format.locktime;
                                  formattedTx[0].vinLen = decodedTx.inputs.length;
                                  formattedTx[0].vinMaxLen = shepherd.appConfig.spv.maxVinParseLimit;
                                  formattedTx[0].opreturn = opreturn[0];
                                  formattedTx[1].height = transaction.height;
                                  formattedTx[1].blocktime = Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp;
                                  formattedTx[1].timereceived = Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timereceived;
                                  formattedTx[1].hex = _rawtxJSON;
                                  formattedTx[1].inputs = decodedTx.inputs;
                                  formattedTx[1].outputs = decodedTx.outputs;
                                  formattedTx[1].locktime = decodedTx.format.locktime;
                                  formattedTx[1].vinLen = decodedTx.inputs.length;
                                  formattedTx[1].vinMaxLen = shepherd.appConfig.spv.maxVinParseLimit;
                                  formattedTx[1].opreturn = opreturn[1];
                                  _rawtx.push(formattedTx[0]);
                                  _rawtx.push(formattedTx[1]);
                                }
                                index++;

                                if (index === json.length) {
                                  ecl.close();

                                  if (isKv) {
                                    let _kvTx = [];

                                    for (let i = 0; i < _rawtx.length; i++) {
                                      if (_rawtx[i].opreturn &&
                                          _rawtx[i].opreturn.kvDecoded) {
                                        _kvTx.push(_rawtx[i]);
                                      }
                                    }

                                    _rawtx = _kvTx;
                                  }

                                  resolve({
                                    msg: 'success',
                                    result: _rawtx,
                                  });
                                }

                                callback();
                                shepherd.log(`tx history main loop ${json.length} | ${index}`, true);
                              } else {
                                callback2();
                              }
                            }

                            if (_decodedInput.txid !== '0000000000000000000000000000000000000000000000000000000000000000') {
                              shepherd.getTransaction(_decodedInput.txid, network, ecl)
                              .then((rawInput) => {
                                const decodedVinVout = shepherd.electrumJSTxDecoder(rawInput, network, _network);

                                if (decodedVinVout) {
                                  shepherd.log(decodedVinVout.outputs[_decodedInput.n], true);
                                  txInputs.push(decodedVinVout.outputs[_decodedInput.n]);
                                }
                                checkLoop();
                              });
                            } else {
                              checkLoop();
                            }
                          });
                        } else {
                          const _parsedTx = {
                            network: decodedTx.network,
                            format: 'cant parse',
                            inputs: 'cant parse',
                            outputs: 'cant parse',
                            height: transaction.height,
                            timestamp: Number(transaction.height) === 0 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp,
                            confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height,
                            opreturn,
                          };

                          const formattedTx = shepherd.parseTransactionAddresses(_parsedTx, _address, network);
                          _rawtx.push(formattedTx);
                          index++;

                          if (index === json.length) {
                            ecl.close();

                            if (isKv) {
                              let _kvTx = [];

                              for (let i = 0; i < _rawtx.length; i++) {
                                if (_rawtx[i].opreturn &&
                                    _rawtx[i].opreturn.kvDecoded) {
                                  _kvTx.push(_rawtx[i]);
                                }
                              }

                              _rawtx = _kvTx;
                            }

                            resolve({
                              msg: 'success',
                              result: _rawtx,
                            });
                          } else {
                            callback();
                          }
                        }
                      });
                    } else {
                      const _parsedTx = {
                        network: 'cant parse',
                        format: 'cant parse',
                        inputs: 'cant parse',
                        outputs: 'cant parse',
                        height: transaction.height,
                        timestamp: 'cant get block info',
                        confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height,
                      };
                      const formattedTx = shepherd.parseTransactionAddresses(_parsedTx, _address, network);
                      _rawtx.push(formattedTx);
                      index++;

                      if (index === json.length) {
                        ecl.close();

                        if (isKv) {
                          let _kvTx = [];

                          for (let i = 0; i < _rawtx.length; i++) {
                            if (_rawtx[i].opreturn &&
                                _rawtx[i].opreturn.kvDecoded) {
                              _kvTx.push(_rawtx[i]);
                            }
                          }

                          _rawtx = _kvTx;
                        }

                        resolve({
                          msg: 'success',
                          result: _rawtx,
                        });
                      } else {
                        callback();
                      }
                    }
                  });
                });
              } else {
                ecl.close();

                resolve({
                  msg: 'success',
                  result: [],
                });
              }
            });
          } else {
            resolve({
              msg: 'error',
              result: 'cant get current height',
            });
          }
        });
      }
    });
  };

  shepherd.get('/electrum/gettransaction', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      const network = req.query.network || shepherd.findNetworkObj(req.query.coin);
      const ecl = shepherd.ecl(network);

      shepherd.log('electrum gettransaction =>', true);

      ecl.connect();
      ecl.blockchainTransactionGet(req.query.txid)
      .then((json) => {
        ecl.close();
        shepherd.log(json, true);

        const successObj = {
          msg: 'success',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  return shepherd;
};