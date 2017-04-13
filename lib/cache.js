/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

const { Graph, json } = require('graphlib');
const assign = require('object-assign');
const { checkFileCache } = require('./check_file_cache');
const { updateGraph } = require('./update_graph');
const { loadFile } = require('./file_process');
const { getDependantLeafs } = require('./graph_utils');
const fs = require('fs');
const path = require('path');

function atom(value) {
  let closure = value;
  return {
    get() {
      return closure;
    },
    set(val) {
      closure = val;
      return closure;
    },
  };
}

let globalGraph = new Graph({ directed: true });

function toCytoGraph(gatom) {
  const g = gatom.get().g;
  const nodes = g.nodes().map((node) => ({
    data: {
      id: node
    }
  }));
  const edges = g.edges().map((edge) => ({
    data: {
      id: edge.v + '_' + edge.w,
      source: edge.v,
      target: edge.w
    }
  }));

  return nodes.concat(edges);
}

function createCacheGraph(parser, sign, opts) {
  const copts = assign({}, {
    persistence: undefined,
    g: new Graph({ directed: true }),
    next: false,
    targetFs: fs,
    cacheVersion: false,
  }, opts);

  if (copts.globalCache) {
    copts.g = globalGraph;
  }

  let loadPromise = Promise.resolve({ gatom: atom(copts) });
  if (copts.persistence && !opts.g) {
    loadPromise = loadFile(copts.persistence, copts.targetFs).then(([file]) => {
      const gjson = JSON.parse(file.toString());
      if (copts.cacheVersion === false || gjson.cacheVersion === copts.cacheVersion) {
        copts.g = json.read(gjson.graph);
      }
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

    visualise(dest) {
      const cytoGraph = toCytoGraph(gatom);
      return new Promise((res, rej) => {
        fs.readFile(path.join(__dirname, '../visual.html'), (err, data) => {
          if (err) {
            rej(err);
          }

          res(data.toString());
        })
      }).then((content) => {
        return content.replace('--placeholder--', JSON.stringify(cytoGraph));
      }).then((writeContent) => {
        return new Promise((res, rej) => {
          fs.writeFile(dest, writeContent, (err) => {
            if (err) {
              rej(err);
            }
            res();
          })
        })
      });
    },

    _toCytoScape() {
      return toCytoGraph(gatom);
    },

    saveGraph() {
      if (gatom.get().persistence) {
        return new Promise((resolve, reject) => {
          const serialized = JSON.stringify({
            graph: json.write(gatom.get().g),
            cacheVersion: copts.cacheVersion,
          });
          gatom.get().targetFs.writeFile(gatom.get().persistence, serialized,
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
        globalGraph = gatom.get().next;
        gatom.set(assign(gatom.get(), {
          g: gatom.get().next,
          next: false,
        }));
      }
    },

    _exposeGraph() {
      return gatom.get().g;
    },

    _exposeNextGraph() {
      return gatom.get().next;
    },
  }));
}

module.exports = {
  createCacheGraph,
};
