const ethers = require('ethers');

module.exports = (api) => {  
  api.post('/eth/auth', (req, res, next) => {
    let seed = req.body.seed;

    if (!api.seed) {
      api.seed = seed;
    }

    const mnemonicWallet = api.eth._keys(seed, true);

    api.eth.wallet = mnemonicWallet;
    api.eth.connect = {};

    for (let key in api.eth.coins) {
      const network = key.toLowerCase().indexOf('ropsten') > -1 ? 'ropsten' : 'homestead';
      
      api.eth._connect(key, network);
      api.eth.coins[key] = {
        pub: api.eth.wallet.signingKey.address,
        network,
      };
    }

    const retObj = {
      msg: 'success',
      result: 'success',
    };

    res.end(JSON.stringify(retObj));
  });

  api.post('/eth/logout', (req, res, next) => {
    api.eth.wallet = null;
    api.eth.connect = null;
    api.ethPriv = null;

    for (let key in api.eth.coins) {
      api.eth.coins[key] = {};
    }

    const retObj = {
      msg: 'success',
      result: 'success',
    };

    res.end(JSON.stringify(retObj));
  });

  return api; 
};
