/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

const { Graph, json } = require('graphlib');
const assign = require('object-assign');
const { checkFileCache } = require('./check_file_cache');
const { updateGraph } = require('./update_graph');
const { loadFile } = require('./file_process');
const { getDependantLeafs } = require('./graph_utils');
const fs = require('fs');
const { atom } = require('derivable');

function createCacheGraph(parser, sign, opts) {
  const copts = assign({}, {
    persistence: undefined,
    g: new Graph({ directed: true }),
    next: false,
  }, opts);

  let loadPromise = Promise.resolve({ gatom: atom(copts) });
  if (copts.persistence && !opts.g) {
    loadPromise = loadFile(copts.persistence).then(([file]) => {
      const gjson = JSON.parse(file.toString());
      copts.g = json.read(gjson);
      return { gatom: atom(copts) };
    }).catch(() => {
      console.warn('Couldn\'t load graph from file:', copts.persistence);
      return { gatom: atom(copts) };
    });
  }

  return loadPromise.then(({ gatom }) => ({
    checkFile(file, filename) {
      return checkFileCache(gatom.get().g, sign, file, filename)
        .then(changed => changed.length === 0);
    },

    rebuildFromFile(file, filename) {
      const gopts = gatom.get();
      if (!gopts.next) {
        gopts.next = json.read(json.write(gopts.g));
      }
      gatom.set(gopts);
      return updateGraph(gopts.next, sign, parser, file, filename)
        .then(nwg => {
          gatom.set(assign(gatom.get(), {
            next: nwg,
          }));
        });
    },

    getChangedLeafs(file, filename) {
      return checkFileCache(gatom.get().g, sign, file, filename)
        .then(changed => getDependantLeafs(gatom.get().g, changed, []));
    },

    saveGraph(target = false) {
      let ctarget = target;
      if (ctarget === false) {
        ctarget = fs;
      }
      if (gatom.get().persistence) {
        return new Promise((resolve, reject) => {
          ctarget.writeFile(gatom.get().persistence, JSON.stringify(json.write(gatom.get().g)),
            (err) => {
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
      if (gatom.get().next) {
        gatom.set(assign(gatom.get(), {
          g: gatom.get().next,
          next: false,
        }));
      }
    },

    _exposeGraph() {
      return gatom.get().g;
    },
  }));
}

module.exports = {
  createCacheGraph,
};
