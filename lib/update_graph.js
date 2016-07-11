const diff = require('lodash.differenceby');
const { getLeafSubGraph } = require('./graph_utils');

function updateGraph(g, sign, parse, file, filename) {
  return parse(sign, file, filename).then(nwg => {
    const subgraph = getLeafSubGraph(g, filename);

    const removedEdges = diff(subgraph.edges(), nwg.edges(),
      (el) => `${el.v}__${el.w}`);

    removedEdges.forEach(edge => {
      g.removeEdge(edge.v, edge.w);
    });

    const removedNodes = diff(subgraph.nodes(), nwg.nodes());

    removedNodes.forEach(node => {
      g.removeNode(node);
    });

    nwg.nodes().forEach(node => {
      g.setNode(node, nwg.node(node));
    });

    nwg.edges().forEach(edge => {
      g.setEdge(edge.v, edge.w);
    });

    return g;
  });
}

module.exports = {
  updateGraph,
};
