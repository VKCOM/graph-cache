const diff = require('lodash.differenceby');

function updateGraph(g, sign, parse, file, filename) {
  return parse(sign, file, filename).then(nwg => {
    const removedEdges = diff(g.edges(), nwg.edges(),
      (el) => `${el.v}__${el.w}`);

    removedEdges.forEach(edge => {
      g.removeEdge(edge.v, edge.w);
    });

    const removedNodes = diff(g.nodes(), nwg.nodes());

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
