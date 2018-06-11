const request = require('request');
const Promise = require('bluebird');

// abstraction layer to communicate with electrum proxies

const proxyServers = [{
  ip: '94.130.225.86',
  port: 9999,
}, {
  ip: '94.130.98.74',
  port: 9999,
}];

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

// pick a random proxy server
const _randomServer = proxyServers[getRandomIntInclusive(0, proxyServers.length - 1)];
const proxyServer = {
  ip: _randomServer.ip,
  port: _randomServer.port,
};

console.log(`proxy server ${proxyServer.ip}:${proxyServer.port}`);

module.exports = (shepherd) => {
  /*shepherd.httpReq = (url, type) => {

  };*/
  shepherd.proxyActiveCoin = {};

  shepherd.proxy = (network) => {
    shepherd.log('proxy =>', true);
    shepherd.log(network, true);

    if (network) {
      shepherd.proxyActiveCoin = network;
    }

    const _electrumServer = {
      port: shepherd.electrumCoins[network].server.port || shepherd.electrumServers[network].port,
      ip: shepherd.electrumCoins[network].server.ip || shepherd.electrumServers[network].address,
      proto: shepherd.electrumCoins[network].server.proto || shepherd.electrumServers[network].proto,
    };

    const makeUrl = (arr) => {
      let _url = [];

      for (key in _electrumServer) {
        _url.push(`${key}=${_electrumServer[key]}`);
      }

      for (key in arr) {
        _url.push(`${key}=${arr[key]}`);
      }

      return _url.join('&');
    };

    return {
      connect: () => {
        shepherd.log('proxy fake connect', true);
      },
      close: () => {
        shepherd.log('proxy fake close', true);
      },
      blockchainAddressGetBalance: (address) => {
        shepherd.log(`proxy blockchainAddressGetBalance ${address}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/getbalance?${makeUrl({ address })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainAddressGetBalance parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainAddressGetBalance ${address}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainAddressGetBalance ${address}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainAddressGetBalance ${address}`, true);
            }
          });
        });
      },
      blockchainAddressListunspent: (address) => {
        shepherd.log(`proxy blockchainAddressListunspent ${address}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/listunspent?${makeUrl({ address })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainAddressListunspent parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainAddressListunspent ${address}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainAddressListunspent ${address}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainAddressListunspent ${address}`, true);
            }
          });
        });
      },
      blockchainAddressGetHistory: (address) => {
        shepherd.log(`proxy blockchainAddressGetHistory ${address}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/listtransactions?${makeUrl({ address })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainAddressGetHistory parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainAddressGetHistory ${address}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainAddressGetHistory ${address}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainAddressGetHistory ${address}`, true);
            }
          });
        });
      },
      blockchainEstimatefee: (blocks) => {
        shepherd.log(`proxy blockchainEstimatefee ${blocks}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/estimatefee?${makeUrl({ blocks })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainEstimatefee parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainEstimatefee ${address}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainEstimatefee ${address}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainEstimatefee ${address}`, true);
            }
          });
        });
      },
      blockchainBlockGetHeader: (height) => {
        shepherd.log(`proxy blockchainBlockGetHeader ${height}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/getblockinfo?${makeUrl({ height })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainBlockGetHeader parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainBlockGetHeader ${height}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainBlockGetHeader ${height}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainBlockGetHeader ${height}`, true);
            }
          });
        });
      },
      blockchainNumblocksSubscribe: () => {
        shepherd.log(`proxy blockchainNumblocksSubscribe`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/getcurrentblock?${makeUrl()}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainNumblocksSubscribe parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainNumblocksSubscribe`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainNumblocksSubscribe`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainNumblocksSubscribe`, true);
            }
          });
        });
      },
      blockchainTransactionGet: (txid) => {
        shepherd.log(`proxy blockchainTransactionGet ${txid}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/gettransaction?${makeUrl({ txid })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainTransactionGet parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainTransactionGet ${txid}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainTransactionGet ${txid}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainTransactionGet ${txid}`, true);
            }
          });
        });
      },
      blockchainTransactionGetMerkle: (txid, height) => {
        shepherd.log(`proxy blockchainTransactionGetMerkle ${txid} ${height}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/getmerkle?${makeUrl({ txid, height })}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainTransactionGetMerkle parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainTransactionGetMerkle ${txid} ${height}`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainTransactionGetMerkle ${txid} ${height}`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainTransactionGetMerkle ${txid} ${height}`, true);
            }
          });
        });
      },
      serverVersion: () => {
        shepherd.log(`proxy serverVersion`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/gettransaction?${makeUrl()}`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy serverVersion parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy serverVersion`);
              } catch (e) {
                shepherd.log(`parse error proxy serverVersion`, true);
              }
            } else {
              shepherd.log(`req error proxy serverVersion`, true);
            }
          });
        });
      },
      blockchainTransactionBroadcast: (rawtx) => {
        shepherd.log(`proxy blockchainTransactionBroadcast ${rawtx}`, true);

        return new Promise((resolve, reject) => {
          let options = {
            url: `http://${proxyServer.ip}:${proxyServer.port}/api/pushtx`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              port: _electrumServer.port,
              ip: _electrumServer.ip,
              proto: _electrumServer.proto,
              rawtx,
            }),
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                shepherd.log('proxy blockchainTransactionBroadcast parsed');
                shepherd.log(_parsedBody);

                if (_parsedBody) {
                  resolve(_parsedBody.result);
                }
                shepherd.log(`proxy blockchainTransactionBroadcast`);
              } catch (e) {
                shepherd.log(`parse error proxy blockchainTransactionBroadcast`, true);
              }
            } else {
              shepherd.log(`req error proxy blockchainTransactionBroadcast`, true);
            }
          });
        });
      },
    };
  };

  return shepherd;
}