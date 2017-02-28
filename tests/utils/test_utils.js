const Graph = require('graphlib').Graph;
const { loadFile } = require('../../lib/file_process');
const { expect, assert } = require('chai');

function testSign(file) {
  return file.length;
}

function createPath(name) {
  return `tests/fixtures/${name}`;
}

function loadTestFile(name) {
  const fname = createPath(name);
  return loadFile(fname);
}

function testGraph() {
  return new Graph({ directed: true });
}

function verifyGraph(g, vertexList, edgeList = []) {
  const nodes = g.nodes().sort().map(node => [node, g.node(node)]);
  const edges = g.edges().sort((a, b) => a.v <= b.v);

  expect(nodes).to.eql(vertexList.sort());
  expect(edges).to.eql(edgeList.sort((a, b) => a.v <= b.v));
}

function loadFiles(...files) {
  return Promise.all(files.map(el => loadTestFile(`${el.toString()}.txt`)));
}

function getName(num) {
  return createPath(`${num.toString()}.txt`);
}

function load2Graph(info = false) {
  return loadFiles(1, 2).then(([[file1, name1], [file2, name2]]) => {
    const g = testGraph();
    g.setNode(name1, testSign(file1));
    g.setNode(name2, testSign(file2));
    g.setEdge(name2, name1);
    if (info) {
      return [g, [file1, file2], [name1, name2]];
    }
    return g;
  });
}

function load3Graph(info = false) {
  return load2Graph(true).then(([g, files, names]) =>
    loadFiles(3).then(([[file, name]]) => {
      g.setNode(name, testSign(file));
      g.setEdge(getName(2), name);
      if (info) {
        return [g, files.concat([file]), names.concat(name)];
      }
      return g;
    })
  );
}

function load3Graph4(info = false) {
  return load2Graph(true).then(([g, files, names]) =>
    loadFiles(4).then(([[file, name]]) => {
      g.setNode(name, testSign(file));
      g.setEdge(name, getName(1));
      if (info) {
        return [g, files.concat([file]), names.concat(name)];
      }
      return g;
    })
  );
}

function load4Graph(info = false) {
  return load3Graph(true).then(([g, files, names]) =>
    loadFiles(4).then(([[file, name]]) => {
      g.setNode(name, testSign(file));
      g.setEdge(name, getName(1));
      if (info) {
        return [g, files.concat(file), names.concat(name)];
      }
      return g;
    })
  );
}

function loadCyclicGraph(info = false) {
  return load2Graph(true).then(([g, files, names]) => {
    g.setEdge(getName(1), getName(2));
    if (info) {
      return [g, files, names];
    }
    return g;
  });
}

function compareGraphs(g, nwg) {
  const nodes1 = g.nodes().sort().map(node => [node, g.node(node)]);
  const nodes2 = nwg.nodes().sort().map(node => [node, g.node(node)]);
  const edges1 = g.edges().sort((a, b) => a.v <= b.v);
  const edges2 = nwg.edges().sort((a, b) => a.v <= b.v);
  assert.deepEqual(nodes1, nodes2, 'nodes are equal');
  assert.deepEqual(edges1, edges2, 'edges are equal');
}

module.exports = {
  loadTestFile,
  testSign,
  testGraph,
  verifyGraph,
  createPath,
  load4Graph,
  load3Graph4,
  load3Graph,
  load2Graph,
  getName,
  loadFiles,
  compareGraphs,
  loadCyclicGraph,
};
