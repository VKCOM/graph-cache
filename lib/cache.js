/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

const { Graph, json } = require('graphlib');
const assign = require('object-assign');
const { checkFileCache } = require('./check_file_cache');
const { updateGraph } = require('./update_graph');
const { loadFile } = require('./file_process');
const { getDependantLeafs } = require('./graph_utils');
const fs = require('fs');

function createCacheGraph(parser, sign, opts) {
  const copts = assign({}, {
    persistence: undefined,
    g: new Graph({ directed: true }),
    nextg: false,
  }, opts);

  let loadPromise = Promise.resolve(copts);

  if (copts.persistence && !opts.g) {
    loadPromise = loadFile(copts.persistence).then(([file]) => {
      const gjson = JSON.parse(file.toString());
      copts.g = json.read(gjson);
      return copts;
    }).catch(() => {
      console.warn('Couldn\'t load graph from file:', copts.persistence);
      return copts;
    });
  }
  return loadPromise.then(gopts => ({
    checkFile(file, filename) {
      return checkFileCache(gopts.g, sign, file, filename)
        .then(changed => changed.length === 0);
    },

    rebuildFromFile(file, filename) {
      if (!gopts.next) {
        gopts.next = json.read(json.write(gopts.g));
      }
      return updateGraph(gopts.next, sign, parser, file, filename)
        .then(nwg => {
          gopts.next = nwg;
        });
    },

    getChangedLeafs(file, filename) {
      return checkFileCache(gopts.g, sign, file, filename)
        .then(changed => getDependantLeafs(gopts.g, changed, changed));
    },

    saveGraph() {
      if (gopts.persistence) {
        return new Promise((resolve, reject) => {
          fs.writeFile(gopts.persistence, JSON.stringify(json.write(gopts.g)), (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      return Promise.resolve();
    },

    swapGraphs() {
      if (gopts.next) {
        gopts.g = gopts.next;
        gopts.next = false;
      }
    },

    _exposeGraph() {
      return gopts.g;
    },
  }));
}

module.exports = {
  createCacheGraph,
};
