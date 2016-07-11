const {Graph} = require('graphlib');
const assign = require('object-assign');
const {checkFileCache} = require('./check_file_cache');
const {updateGraph} = require('./update_graph');
const {sign} = require('./file_process');

function createCacheGraph(parser, opts) {
  let g = new Graph({ directed: true });

  opts = assign({}, {
    persistence: undefined
  }, opts);

  return {
    checkFile(file, filename) {
      return checkFileCache(g, sign, file, filename)
        .then(changed => changed.length === 0);
    },

    rebuildFromFile(file, filename) {
      return updateGraph(g, sign, parser.parse, file, flename);
    },

    getChangedLeafs(file, fileName) {
      return checkFileCache(g, sign, file, filename)
        .then(changed => getDependantLeafs(g, changed, []));
    }
  };
}

module.exports = {
  createCacheGraph
};
