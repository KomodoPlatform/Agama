const request = require('request');
const Promise = require('bluebird');

let btcFeeBlocks = [];

for (let i = 0; i < 25; i++) {
  btcFeeBlocks.push(i);
}

const checkTimestamp = (dateToCheck) => {
  const currentEpochTime = new Date(Date.now()) / 1000;
  const secondsElapsed = Number(currentEpochTime) - Number(dateToCheck);

  return Math.floor(secondsElapsed);
}

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

let btcFees = {
  recommended: {},
  all: {},
  electrum: {},
  lastUpdated: null,
};

const BTC_FEES_MIN_ELAPSED_TIME = 120;

module.exports = (shepherd) => {
  shepherd.get('/electrum/btcfees', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      if (checkTimestamp(btcFees.lastUpdated) > BTC_FEES_MIN_ELAPSED_TIME) {
        const _randomServer = shepherd.electrumServers.btc.serverList[getRandomIntInclusive(0, shepherd.electrumServers.btc.serverList.length - 1)].split(':');
        const ecl = new shepherd.electrumJSCore(_randomServer[1], _randomServer[0], 'tcp');
        let _btcFeeEstimates = [];

        console.log(`btc fees server ${_randomServer.join(':')}`);

        ecl.connect();
        Promise.all(btcFeeBlocks.map((coin, index) => {
          return new Promise((resolve, reject) => {
            ecl.blockchainEstimatefee(index + 1)
            .then((json) => {
              resolve(true);

              if (json > 0) {
                _btcFeeEstimates.push(Math.floor((json / 1024) * 100000000));
              }
            });
          });
        }))
        .then(result => {
          ecl.close();

          if (result &&
              result.length) {
            btcFees.electrum = _btcFeeEstimates;
          } else {
            btcFees.electrum = 'error';
          }

          let options = {
            url: `https://bitcoinfees.earn.com/api/v1/fees/recommended`,
            method: 'GET',
          };

          // send back body on both success and error
          // this bit replicates iguana core's behaviour
          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);
                btcFees.lastUpdated = Math.floor(Date.now() / 1000);
                btcFees.recommended = _parsedBody;
              } catch (e) {
                shepherd.log('unable to retrieve BTC fees / recommended', true);
              }
            } else {
              shepherd.log('unable to retrieve BTC fees / recommended', true);
            }

            res.end(JSON.stringify({
              msg: 'success',
              result: btcFees,
            }));
          });
        });
      } else {
        console.log(`btcfees, use cache`);

        const successObj = {
          msg: 'success',
          result: btcFees,
        };

        res.end(JSON.stringify(successObj));
      }
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