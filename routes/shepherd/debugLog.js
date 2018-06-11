const path = require('path');
const _fs = require('graceful-fs');
const Promise = require('bluebird');
const os = require('os');

module.exports = (shepherd) => {
  /*
   *  type: POST
   *  params: herd, lastLines
   */
  shepherd.post('/debuglog', (req, res) => {
    if (shepherd.checkToken(req.body.token)) {
      let _herd = req.body.herdname;
      let _ac = req.body.ac;
      let _lastNLines = req.body.lastLines;
      let _location;
      const _platform = os.platform();

      switch (_platform) {
        case 'darwin':
          shepherd.komodoDir = shepherd.appConfig.dataDir.length ? shepherd.appConfig.dataDir : `${process.env.HOME}/Library/Application Support/Komodo`;
          break;
        case 'linux':
          shepherd.komodoDir = shepherd.appConfig.dataDir.length ? shepherd.appConfig.dataDir : `${process.env.HOME}/.komodo`;
          break;
        case 'win32':
          shepherd.komodoDir = shepherd.appConfig.dataDir.length ? shepherd.appConfig.dataDir : `${process.env.APPDATA}/Komodo`;
          shepherd.komodoDir = path.normalize(shepherd.komodoDir);
          break;
      }

      if (_herd === 'komodo') {
        _location = shepherd.komodoDir;
      }

      if (_ac) {
        _location = `${shepherd.komodoDir}/${_ac}`;

        if (_ac === 'CHIPS') {
          _location = shepherd.chipsDir;
        }
      }

      shepherd.readDebugLog(`${_location}/debug.log`, _lastNLines)
      .then((result) => {
        const _obj = {
          msg: 'success',
          result: result,
        };

        res.end(JSON.stringify(_obj));
      }, (result) => {
        const _obj = {
          msg: 'error',
          result: result,
        };

        res.end(JSON.stringify(_obj));
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.get('/coind/stdout', (req, res) => {
    if (shepherd.checkToken(req.query.token)) {
      const _daemonName = req.query.chain !== 'komodod' && req.query.chain.toLowerCase() !== 'kmd' ? req.query.chain : 'komodod';
      const _daemonLogName = `${shepherd.agamaDir}/${_daemonName}.log`;

      shepherd.readDebugLog(_daemonLogName, 'all')
      .then((result) => {
        const _obj = {
          msg: 'success',
          result: result,
        };

        res.end(JSON.stringify(_obj));
      }, (result) => {
        const _obj = {
          msg: 'error',
          result: result,
        };

        res.end(JSON.stringify(_obj));
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.readDebugLog = (fileLocation, lastNLines) => {
    return new Promise((resolve, reject) => {
      if (lastNLines) {
        try {
          _fs.access(fileLocation, shepherd.fs.constants.R_OK, (err) => {
            if (err) {
              shepherd.log(`error reading ${fileLocation}`);
              shepherd.writeLog(`error reading ${fileLocation}`);
              reject(`readDebugLog error: ${err}`);
            } else {
              shepherd.log(`reading ${fileLocation}`);
              _fs.readFile(fileLocation, 'utf-8', (err, data) => {
                if (err) {
                  shepherd.writeLog(`readDebugLog err: ${err}`);
                  shepherd.log(`readDebugLog err: ${err}`);
                }

                const lines = data.trim().split('\n');
                let lastLine;

                if (lastNLines === 'all') {
                  lastLine = data.trim();
                } else {
                  lastLine = lines.slice(lines.length - lastNLines, lines.length).join('\n');
                }

                resolve(lastLine);
              });
            }
          });
        } catch (e) {
          reject(`readDebugLog error: ${e}`);
        }
      } else {
        reject('readDebugLog error: lastNLines param is not provided!');
      }
    });
  };

  return shepherd;
};