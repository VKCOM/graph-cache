'use strict';

var fs = require('fs');

function loadFile(fname, targetFs) {
  return new Promise(function (resolve, reject) {
    (targetFs || fs).readFile(fname, function (error, file) {
      if (error) {
        reject(error);
      } else {
        resolve([file, fname]);
      }
    });
  });
}

module.exports = {
  loadFile: loadFile
};