const fs = require('fs');
const Graph = require('graphlib').Graph;
const {loadFile} = require('../../lib/file_process');
const {expect} = require('chai');

function testSign(file) {
  return file.length;
}

function loadTestFile(name) {
  const fname = createPath(name);
  return loadFile(fname);
}

function testGraph() {
  return new Graph({ directed: true });
}

function createPath(name) {
  return `tests/fixtures/${name}`;
}

function verifyGraph(g, vertexList, edgeList = []) {
  let nodes = g.nodes().sort().map(node => [node, g.node(node)]);
  let edges = g.edges().sort((a, b) => a.v <= b.v);

  edgeList = edgeList.map(e => ({ v: createPath(e.v), w: createPath(e.w) }))
    .sort((a, b) => a.v <= b.v);
  vertexList = vertexList.map((node) => [createPath(node[0]), node[1]]).sort();

  expect(nodes).to.eql(vertexList);
  expect(edges).to.eql(edgeList);
}

module.exports = {
  loadTestFile,
  testSign,
  testGraph,
  verifyGraph
}
