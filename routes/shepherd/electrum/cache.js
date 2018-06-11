const fs = require('fs-extra');
const _fs = require('graceful-fs');
const fsnode = require('fs');
const Promise = require('bluebird');

module.exports = (shepherd) => {
  shepherd.loadLocalSPVCache = () => {
    if (fs.existsSync(`${shepherd.agamaDir}/spv-cache.json`)) {
      let localCache = fs.readFileSync(`${shepherd.agamaDir}/spv-cache.json`, 'utf8');

      shepherd.log('local spv cache loaded from local file');

      try {
        shepherd.electrumCache = JSON.parse(localCache);
      } catch (e) {
        shepherd.log('local spv cache file is damaged, create new');
        shepherd.saveLocalSPVCache();
        shepherd.electrumCache = {};
      }
    } else {
      shepherd.log('local spv cache file is not found, create new');
      shepherd.saveLocalSPVCache();
      shepherd.electrumCache = {};
    }
  };

  shepherd.saveLocalSPVCache = () => {
    let spvCacheFileName = `${shepherd.agamaDir}/spv-cache.json`;

    _fs.access(shepherd.agamaDir, shepherd.fs.constants.R_OK, (err) => {
      if (!err) {
        const FixFilePermissions = () => {
          return new Promise((resolve, reject) => {
            const result = 'spv-cache.json file permissions updated to Read/Write';

            fsnode.chmodSync(spvCacheFileName, '0666');

            setTimeout(() => {
              shepherd.log(result);
              shepherd.writeLog(result);
              resolve(result);
            }, 1000);
          });
        }

        const FsWrite = () => {
          return new Promise((resolve, reject) => {
            const result = 'spv-cache.json write file is done';

            const err = fs.writeFileSync(spvCacheFileName,
                        JSON.stringify(shepherd.electrumCache)
                        /*.replace(/,/g, ',\n') // format json in human readable form
                        .replace(/":/g, '": ')
                        .replace(/{/g, '{\n')
                        .replace(/}/g, '\n}')*/, 'utf8');

            if (err)
              return shepherd.log(err);

            fsnode.chmodSync(spvCacheFileName, '0666');
            setTimeout(() => {
              shepherd.log(result);
              shepherd.log(`spv-cache.json file is created successfully at: ${shepherd.agamaDir}`);
              resolve(result);
            }, 2000);
          });
        }

        FsWrite()
        .then(FixFilePermissions());
      }
    });
  }

  /*
   *  type: POST
   *
   */
  shepherd.post('/electrum/cache/delete', (req, res, next) => {
    if (shepherd.checkToken(req.body.token)) {
      shepherd.electrumCache = {};
      shepherd.saveLocalSPVCache();

      const returnObj = {
        msg: 'success',
        result: `spv cache is removed`,
      };

      res.end(JSON.stringify(returnObj));
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