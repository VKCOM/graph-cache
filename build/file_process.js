'use strict';

var fs = require('fs');

function loadFile(fname) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fname, function (error, file) {
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