const bs58check = require('bs58check');
const bitcoinZcash = require('bitcoinjs-lib-zcash');
const bitcoin = require('bitcoinjs-lib');

module.exports = (shepherd) => {
  shepherd.post('/electrum/login', (req, res, next) => {
    if (shepherd.checkToken(req.body.token)) {
      const _seed = req.body.seed;
      const isIguana = req.body.iguana;
      const _wifError = shepherd.auth(_seed, isIguana);

      // shepherd.log(JSON.stringify(shepherd.electrumKeys, null, '\t'), true);

      const successObj = {
        msg: _wifError ? 'error' : 'success',
        result: 'true',
      };

      res.end(JSON.stringify(successObj));
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.auth = (seed, isIguana) => {
    let _wifError = false;

    for (let key in shepherd.electrumCoins) {
      if (key !== 'auth') {
        const _seed = seed;
        let keys;
        let isWif = false;

        if (_seed.match('^[a-zA-Z0-9]{34}$') &&
            shepherd.appConfig.experimentalFeatures) {
          shepherd.log('watchonly pub addr');
          shepherd.electrumKeys[key] = {
            priv: _seed,
            pub: _seed,
          };
          shepherd._isWatchOnly = true;
        } else {
          shepherd._isWatchOnly = false;

          try {
            bs58check.decode(_seed);
            isWif = true;
          } catch (e) {}

          if (isWif) {
            try {
              const _key = shepherd.isZcash(key.toLowerCase()) ? bitcoinZcash.ECPair.fromWIF(_seed, shepherd.getNetworkData(key.toLowerCase()), true) : bitcoin.ECPair.fromWIF(_seed, shepherd.getNetworkData(key.toLowerCase()), true);
              keys = {
                priv: _key.toWIF(),
                pub: _key.getAddress(),
              };
            } catch (e) {
              _wifError = true;
              break;
            }
          } else {
            keys = shepherd.seedToWif(
              _seed,
              shepherd.findNetworkObj(key),
              isIguana,
            );
          }

          shepherd.electrumKeys[key] = {
            priv: keys.priv,
            pub: keys.pub,
          };
        }
      }
    }

    shepherd.electrumCoins.auth = true;

    return _wifError;
  };

  shepherd.post('/electrum/lock', (req, res, next) => {
    if (shepherd.checkToken(req.body.token)) {
      shepherd.electrumCoins.auth = false;
      shepherd.electrumKeys = {};

      const successObj = {
        msg: 'success',
        result: 'true',
      };

      res.end(JSON.stringify(successObj));
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.post('/electrum/logout', (req, res, next) => {
    if (shepherd.checkToken(req.body.token)) {
      shepherd.electrumCoins = {
        auth: false,
      };
      shepherd.electrumKeys = {};

      const obj = {
        msg: 'success',
        result: 'result',
      };

      res.end(JSON.stringify(obj));
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