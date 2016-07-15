const { loadFile } = require('./file_process');
const { getDepencies } = require('./graph_utils');

function processDep(sign, name) {
  return loadFile(name)
    .then(([file, fname]) => [fname, sign(file)])
    .catch(() => [name, false]);
}

function checkFileCache(g, sign, file, filename) {
  if (!g.node(filename)) {
    return Promise.resolve([filename]);
  }

  const signature = g.node(filename);
  const currSig = sign(file);
  if (currSig !== signature) {
    return Promise.resolve([filename]);
  }

  const depsPromises = getDepencies(g, [filename], [])
    .map(processDep.bind(null, sign));

  if (depsPromises.length === 0) {
    return Promise.resolve([]);
  }

  return Promise.all(depsPromises).then(deps =>
    deps.filter(dep => g.node(dep[0]) !== dep[1]).map(el => el[0])
  );
}

module.exports = {
  checkFileCache,
};
