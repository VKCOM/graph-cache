function getDepencies(g, nodes, acc) {
  const newNodes = nodes.reduce((nacc, node) =>
    nacc.concat(g.predecessors(node)), []);

  if (newNodes.length === 0) {
    return acc;
  }

  return getDepencies(g, newNodes, acc.concat(newNodes));
}

function getDependantLeafs(g, nodes, acc) {
  const newNodes = nodes.reduce((nacc, node) =>
    nacc.concat(g.succesors(node)), []);

  if (newNodes.length === 0) {
    return acc;
  }

  return getDependantLeafs(g, newNodes, newNodes);
}

module.exports = {
  getDepencies,
  getDependantLeafs,
};
