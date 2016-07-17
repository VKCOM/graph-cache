const fs = require('fs');

function loadFile(fname, targetFs) {
  return new Promise((resolve, reject) => {
    (targetFs || fs).readFile(fname, (error, file) => {
      if (error) {
        reject(error);
      } else {
        resolve([file, fname]);
      }
    });
  });
}

module.exports = {
  loadFile,
};
