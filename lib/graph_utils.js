function getDepencies(g, nodes, acc) {
  const newNodes = nodes.reduce((acc, node) =>
    acc.concat(g.predecessors(node)), []);

  if (newNodes.length === 0) {
    return acc;
  } else {
    return getDepencies(g, newNodes, acc.concat(newNodes));
  }
}

function getDependantLeafs(g, nodes, acc) {
  const newNodes = nodes.reduce((acc, node) =>
    acc.concat(g.succesors(node)), []);

  if (newNodes.length === 0) {
    return acc;
  } else {
    return getDependantLeafs(g, newNodes, newNodes);
  }
}

module.exports = {
  getDepencies
};
