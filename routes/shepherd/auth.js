const passwdStrength = require('passwd-strength');

module.exports = (shepherd) => {
  /*
   *  type: GET
   *
   */
  shepherd.get('/auth/status', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      let successObj;
      let _status = false;

      if (Object.keys(shepherd.coindInstanceRegistry).length) {
        if (Object.keys(shepherd.electrumCoins).length > 1 &&
            shepherd.electrumCoins.auth) {
          _status = true;
        } else if (
          Object.keys(shepherd.electrumCoins).length === 1 &&
          !shepherd.electrumCoins.auth
        ) {
          _status = true;
        }
      } else if (
        Object.keys(shepherd.electrumCoins).length > 1 &&
        shepherd.electrumCoins.auth
      ) {
        _status = true;
      } else if (
        Object.keys(shepherd.electrumCoins).length === 1 &&
        !Object.keys(shepherd.coindInstanceRegistry).length
      ) {
        _status = true;
      }

      successObj = {
        status: _status ? 'unlocked' : 'locked',
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

  shepherd.checkToken = (token) => {
    if (token === shepherd.appSessionHash ||
        process.argv.indexOf('devmode') > -1) {
      return true;
    }
  };

  shepherd.checkStringEntropy = (str) => {
    // https://tools.ietf.org/html/rfc4086#page-35
    return passwdStrength(str) < 29 ? false : true;
  };

  shepherd.isWatchOnly = () => {
    return shepherd._isWatchOnly;
  };

  shepherd.setPubkey = (seed, coin) => {
    const {
      pub,
      pubHex,
    } = shepherd.seedToWif(seed, 'komodo', true);

    shepherd.staking[coin] = {
      pub,
      pubHex,
    };

    shepherd.log(`pub key for ${coin} is set`);
    shepherd.log(shepherd.staking[coin]);
  };

  shepherd.getPubkeys = () => {
    return shepherd.staking;
  };

  shepherd.removePubkey = (coin) => {
    delete shepherd.staking[coin];
  };

  return shepherd;
};