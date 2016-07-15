const uniq = require('lodash.uniq');

function getDepencies(g, nodes, acc) {
  const newNodes = nodes.reduce((nacc, node) =>
    nacc.concat(g.predecessors(node)), []);

  if (newNodes.length === 0) {
    return uniq(acc);
  }

  return getDepencies(g, newNodes, acc.concat(newNodes));
}

function getDependantLeafs(g, nodes, acc) {
  const newNodes = nodes.reduce((nacc, node) =>
    nacc.concat(g.successors(node)), []);
  if (newNodes.length === 0) {
    return uniq(acc);
  }

  return getDependantLeafs(g, newNodes, acc.concat(newNodes));
}

module.exports = {
  getDepencies,
  getDependantLeafs,
};
