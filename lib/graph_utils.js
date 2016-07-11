const { Graph } = require('graphlib');

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

function traverseAndCopyFromLeafs(g, ng, leafs) {
  let edges = [];
  leafs.forEach(leaf => {
    ng.setNode(leaf, g.node(leaf));
    edges = edges.concat(g.inEdges(leaf));
  });

  edges.forEach(edge => {
    ng.setEdge(edge.v, edge.w);
  });

  const branches = leafs.reduce((acc, leaf) =>
    acc.concat(g.predecessors(leaf)), []);

  if (branches.length === 0) {
    return ng;
  }

  return traverseAndCopyFromLeafs(g, ng, branches);
}

function getLeafSubGraph(g, leaf) {
  const ng = new Graph({ directed: true });
  return traverseAndCopyFromLeafs(g, ng, [leaf]);
}

module.exports = {
  getDepencies,
  getDependantLeafs,
  getLeafSubGraph,
};
