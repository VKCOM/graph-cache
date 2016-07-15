const { Graph } = require('graphlib');
const assign = require('object-assign');
const { checkFileCache } = require('./check_file_cache');
const { updateGraph } = require('./update_graph');
const { sign } = require('./file_process');
const { getDependantLeafs } = require('./graph_utils');

function createCacheGraph(parser, opts) {
  const g = new Graph({ directed: true });

  const copts = assign({}, {
    persistence: undefined,
  }, opts);

  return {
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
  };
}

module.exports = {
  createCacheGraph,
};
