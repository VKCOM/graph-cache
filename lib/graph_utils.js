const uniq = require('lodash.uniq');
const diff = require('lodash.differenceby');
const includes = require('lodash.includes');

function getDepencies(g, nodes, acc) {
  const newNodes = nodes
    .reduce((nacc, node) => nacc.concat(g.predecessors(node)), [])
    .filter((el) => !includes(acc, el));

  if (newNodes.length === 0) {
    return uniq(acc);
  }

  return getDepencies(g, newNodes, acc.concat(newNodes));
}

function getDependantLeafs(g, nodes, acc) {
  const leafs = nodes.filter(node => (g.successors(node) || []).length === 0);
  const notLeafs = diff(nodes, leafs);
  const newNodes = notLeafs.reduce((nacc, node) =>
    nacc.concat(g.successors(node) || []), []);

  if (newNodes.length === 0) {
    return uniq(acc.concat(leafs));
  }

  return getDependantLeafs(g, newNodes, acc.concat(leafs));
}

module.exports = {
  getDepencies,
  getDependantLeafs,
};
