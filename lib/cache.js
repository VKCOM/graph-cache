/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

const { Graph, json } = require('graphlib');
const assign = require('object-assign');
const { checkFileCache } = require('./check_file_cache');
const { updateGraph } = require('./update_graph');
const { loadFile } = require('./file_process');
const { getDependantLeafs } = require('./graph_utils');

function createCacheGraph(parser, sign, opts) {
  const copts = assign({}, {
    persistence: undefined,
    g: new Graph({ directed: true }),
  }, opts);

  let loadPromise = Promise.resolve(copts.g);

  if (copts.persistence && !opts.g) {
    loadPromise = loadFile(copts.persistence).then(([file]) => {
      const gjson = JSON.parse(file.toString());
      return json.read(gjson);
    }).catch(() => {
      console.warn('Couldn\'t load graph from file:', copts.persistence);
      return copts.g;
    });
  }
  return loadPromise.then((g) => ({
    checkFile(file, filename) {
      return checkFileCache(g, sign, file, filename)
        .then(changed => changed.length === 0);
    },

    rebuildFromFile(file, filename) {
      return updateGraph(g, sign, parser.parse, file, filename);
    },

    getChangedLeafs(file, filename) {
      return checkFileCache(g, sign, file, filename)
        .then(changed => getDependantLeafs(g, changed, []));
    },

    _exposeGraph() {
      return g;
    },
  }));
}

module.exports = {
  createCacheGraph,
};
