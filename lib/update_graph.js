const diff = require('lodash.differenceby');

function ensureConnectivity(g, nwg, leafs) {
  let nextCheck = [];
  leafs.forEach(leaf => {
    nextCheck = nextCheck.concat(g.predecessors(leaf) || []);
    if (!nwg.node(leaf) && g.successors(leaf).length === 0) {
      g.removeNode(leaf);
    }
  });

  if (nextCheck.length === 0) {
    return g;
  }

  return ensureConnectivity(g, nwg, nextCheck);
}

function updateEdges(g, nwg, leaf) {
  const oldEdges = g.inEdges(leaf) || [];
  const newEdges = nwg.inEdges(leaf) || [];
  const removedEdges = diff(oldEdges, newEdges,
    (el) => `${el.v}__${el.w}`);
  removedEdges.forEach(edge => {
    g.removeEdge(edge.v, edge.w);
  });
  newEdges.forEach(edge => {
    g.setEdge(edge.v, edge.w);
  });
}

function walkTogether(nwg, g, leafs) {
  let nextLeafs = [];
  leafs.forEach(([leaf, parent]) => {
    const curPred = nwg.predecessors(leaf) || [];
    const oldPred = g.predecessors(leaf) || [];
    nextLeafs = nextLeafs.concat(curPred.map(el => [el, leaf]));
    if (!nwg.node(leaf)) {
      g.removeNode(leaf);
    } else if (!g.node(leaf)) {
      g.setNode(leaf, nwg.node(leaf));
      if (parent !== null) {
        g.setEdge(leaf, parent);
      }
      updateEdges(g, nwg, leaf);
    } else if (nwg.node(leaf) !== g.node(leaf)) {
      g.setNode(leaf, nwg.node(leaf));
      updateEdges(g, nwg, leaf);
    } else {
      updateEdges(g, nwg, leaf);
    }
    const diffPred = diff(oldPred, curPred);
    if (diffPred.length > 0) {
      ensureConnectivity(g, nwg, diffPred);
    }
  });

  if (nextLeafs.length === 0) {
    return g;
  }
  return walkTogether(nwg, g, nextLeafs);
}

function updateGraph(g, sign, parse, file, filename) {
  return parse(sign, file, filename).then(nwg =>
    walkTogether(nwg, g, [[filename, null]], false));
}

module.exports = {
  updateGraph,
};
