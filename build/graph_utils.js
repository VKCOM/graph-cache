'use strict';

var uniq = require('lodash.uniq');

function getDepencies(g, nodes, acc) {
  var newNodes = nodes.reduce(function (nacc, node) {
    return nacc.concat(g.predecessors(node));
  }, []);

  if (newNodes.length === 0) {
    return uniq(acc);
  }

  return getDepencies(g, newNodes, acc.concat(newNodes));
}

function getDependantLeafs(g, nodes, acc) {
  var newNodes = nodes.reduce(function (nacc, node) {
    return nacc.concat(g.successors(node));
  }, []);
  if (newNodes.length === 0) {
    return uniq(acc);
  }

  return getDependantLeafs(g, newNodes, acc.concat(newNodes));
}

module.exports = {
  getDepencies: getDepencies,
  getDependantLeafs: getDependantLeafs
};