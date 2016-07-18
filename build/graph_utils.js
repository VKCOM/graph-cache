'use strict';

var uniq = require('lodash.uniq');
var diff = require('lodash.differenceby');

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
  var leafs = nodes.filter(function (node) {
    return (g.successors(node) || []).length === 0;
  });
  var notLeafs = diff(nodes, leafs);
  var newNodes = notLeafs.reduce(function (nacc, node) {
    return nacc.concat(g.successors(node) || []);
  }, []);

  if (newNodes.length === 0) {
    return uniq(acc.concat(leafs));
  }

  return getDependantLeafs(g, newNodes, acc.concat(leafs));
}

module.exports = {
  getDepencies: getDepencies,
  getDependantLeafs: getDependantLeafs
};