'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('./file_process'),
    loadFile = _require.loadFile;

var _require2 = require('./graph_utils'),
    getDepencies = _require2.getDepencies;

function processDep(sign, name) {
  return loadFile(name).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        file = _ref2[0],
        fname = _ref2[1];

    return [fname, sign(file)];
  }).catch(function () {
    return [name, false];
  });
}

function checkFileCache(g, sign, file, filename) {
  if (!g.node(filename)) {
    return Promise.resolve([filename]);
  }

  var signature = g.node(filename);
  var currSig = sign(file);
  if (currSig !== signature) {
    return Promise.resolve([filename]);
  }

  var depsPromises = getDepencies(g, [filename], []).map(processDep.bind(null, sign));

  if (depsPromises.length === 0) {
    return Promise.resolve([]);
  }

  return Promise.all(depsPromises).then(function (deps) {
    return deps.filter(function (dep) {
      return g.node(dep[0]) !== dep[1];
    }).map(function (el) {
      return el[0];
    });
  });
}

module.exports = {
  checkFileCache: checkFileCache
};