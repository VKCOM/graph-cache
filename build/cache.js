'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

var _require = require('graphlib');

var Graph = _require.Graph;
var json = _require.json;

var assign = require('object-assign');

var _require2 = require('./check_file_cache');

var checkFileCache = _require2.checkFileCache;

var _require3 = require('./update_graph');

var updateGraph = _require3.updateGraph;

var _require4 = require('./file_process');

var loadFile = _require4.loadFile;

var _require5 = require('./graph_utils');

var getDependantLeafs = _require5.getDependantLeafs;

var fs = require('fs');

function createCacheGraph(parser, sign, opts) {
  var copts = assign({}, {
    persistence: undefined,
    g: new Graph({ directed: true }),
    nextg: false
  }, opts);

  var loadPromise = Promise.resolve(copts.g);

  if (copts.persistence && !opts.g) {
    loadPromise = loadFile(copts.persistence).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var file = _ref2[0];

      var gjson = JSON.parse(file.toString());
      copts.g = json.read(gjson);
      return copts;
    }).catch(function () {
      console.warn('Couldn\'t load graph from file:', copts.persistence);
      return copts;
    });
  }
  return loadPromise.then(function (gopts) {
    return {
      checkFile: function checkFile(file, filename) {
        return checkFileCache(gopts.g, sign, file, filename).then(function (changed) {
          return changed.length === 0;
        });
      },
      rebuildFromFile: function rebuildFromFile(file, filename) {
        return updateGraph(gopts.next || gopts.g, sign, parser, file, filename).then(function (nwg) {
          gopts.next = nwg;
        });
      },
      getChangedLeafs: function getChangedLeafs(file, filename) {
        return checkFileCache(gopts.g, sign, file, filename).then(function (changed) {
          return getDependantLeafs(gopts.g, changed, []);
        });
      },
      saveGraph: function saveGraph() {
        if (gopts.persistence) {
          return new Promise(function (resolve, reject) {
            fs.writeFile(gopts.persistence, json.write(gopts.g), function (err) {
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
      swapGraphs: function swapGraphs() {
        gopts.g = gopts.next;
        gopts.next = false;
      },
      _exposeGraph: function _exposeGraph() {
        return gopts.g;
      }
    };
  });
}

module.exports = {
  createCacheGraph: createCacheGraph
};