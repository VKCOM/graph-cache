const fs = require('fs');

function loadFile(fname) {
  return new Promise((resolve, reject) => {
    fs.readFile(fname, (error, file) => {
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
