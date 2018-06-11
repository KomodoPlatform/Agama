const fs = require('fs-extra');
const request = require('request');
const { secondsToString } = require('agama-wallet-lib/src/time');

module.exports = (shepherd) => {
  shepherd.get('/electrum/listtransactions/csv', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      shepherd.listtransactions({
        network: req.query.network,
        coin: req.query.coin,
        address: req.query.address,
        maxlength: 400,
        full: true,
      })
      .then((txhistory) => {
        const _coin = req.query.coin || req.query.network;
        const _time = secondsToString(Date.now() / 1000).replace(/\s+/g, '-');

        shepherd.log(`csv ${_coin} txhistory length ${txhistory.result.length}`, true);

        if (txhistory.msg === 'success' &&
            txhistory.result &&
            txhistory.result.length) {
          let _csv = ['Direction, Time, Amount, Address, TXID'];

          for (let i = 0; i < txhistory.result.length; i++) {
            _csv.push(`${txhistory.result[i].type}, ${secondsToString(txhistory.result[i].timestamp)}, ${txhistory.result[i].amount}, ${txhistory.result[i].address || ''}, ${txhistory.result[i].txid}`);
          }

          const err = fs.writeFileSync(`${shepherd.agamaDir}/shepherd/csv/${_coin.toUpperCase()}-${req.query.address}-${_time}.csv`, _csv.join('\r\n'), 'utf8');

          if (err) {
            res.end(JSON.stringify({
              msg: 'error',
              result: 'can\'t create a file',
            }));
          } else {
            res.end(JSON.stringify({
              msg: 'success',
              result: `${shepherd.agamaDir}/shepherd/csv/${_coin.toUpperCase()}-${req.query.address}-${_time}.csv`,
            }));
          }
        } else {
          res.end(JSON.stringify(txhistory));
        }
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.get('/native/listtransactions/csv', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      const _coin = req.query.coin;
      const _time = secondsToString(Date.now() / 1000).replace(/\s+/g, '-');

      const _payload = {
        mode: null,
        chain: _coin,
        cmd: 'listtransactions',
        params: [
          '*',
          1000,
          0
        ],
        rpc2cli: req.query.rpc2cli || false,
        token: req.query.token,
      };

      const options = {
        url: `http://127.0.0.1:${shepherd.appConfig.agamaPort}/shepherd/cli`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: _payload }),
        timeout: 120000,
      };

      request(options, (error, response, body) => {
        try {
          const txhistory = JSON.parse(body);

          if (!txhistory.error &&
              !txhistory.id &&
              txhistory.result &&
              txhistory.result.length) {
            shepherd.log(`csv ${_coin} native txhistory length ${txhistory.result.length}`, true);

            let _csv = ['Direction, Time, Amount, Address, TXID'];

            for (let i = 0; i < txhistory.result.length; i++) {
              _csv.push(`${txhistory.result[i].category}, ${secondsToString(txhistory.result[i].time)}, ${txhistory.result[i].amount}, ${txhistory.result[i].address || ''}, ${txhistory.result[i].txid}`);
            }

            const err = fs.writeFileSync(`${shepherd.agamaDir}/shepherd/csv/${_coin.toUpperCase()}-native-all-${_time}.csv`, _csv.join('\r\n'), 'utf8');

            if (err) {
              res.end(JSON.stringify({
                msg: 'error',
                result: 'can\'t create a file',
              }));
            } else {
              res.end(JSON.stringify({
                msg: 'success',
                result: `${shepherd.agamaDir}/shepherd/csv/${_coin.toUpperCase()}-native-all-${_time}.csv`,
              }));
            }
          } else {
            res.end(JSON.stringify({
              msg: 'error',
              result: 'general error or empty transactions list',
            }));
          }
        } catch (e) {
          shepherd.log(`csv ${_coin} native txhistory error ${e}`);
        }
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