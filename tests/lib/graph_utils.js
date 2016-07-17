const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { testGraph } = require('../utils/test_utils');

chai.use(chaiAsPromised);
const { expect } = chai;

function get1Graph() {
  const g = testGraph();
  g.setNode(1);
  return g;
}

function get2Graph() {
  const g = get1Graph();
  g.setNode(2);
  g.setEdge(2, 1);
  return g;
}

function get3Graph() {
  const g = get2Graph();
  g.setNode(3);
  g.setEdge(3, 1);
  return g;
}

function get4Graph() {
  const g = get3Graph();
  g.setNode(4);
  g.setEdge(4, 3);
  return g;
}

function getFullGraph() {
  const g = get4Graph();
  g.setNode(5);
  g.setEdge(4, 5);
  g.setEdge(5, 3);
  return g;
}

const { getDepencies, getDependantLeafs } = require('../../lib/graph_utils');

describe('getDepencies', () => {
  it('returns empty array if node has no deps', () => {
    const g = get1Graph();
    expect(getDepencies(g, [1], [])).to.eql([]);
  });

  it('returns deps from leaf with 1 dep', () => {
    const g = get2Graph();
    expect(getDepencies(g, [1], [])).to.eql(['2']);
  });

  it('returns deps from leaf with 2 deps', () => {
    const g = get3Graph();
    expect(getDepencies(g, [1], [])).to.eql(['2', '3']);
  });

  it('returns deps from leaf with 2 layers of deps', () => {
    const g = get4Graph();
    expect(getDepencies(g, [1], [])).to.eql(['2', '3', '4']);
  });

  it('returns deps for full graph', () => {
    const g = getFullGraph();
    expect(getDepencies(g, [1], [])).to.eql(['2', '3', '4', '5']);
  });
});

describe('getDependantLeafs', () => {

  it('returns empty array, if node doesn\'t exist', () => {
    const g = testGraph();
    expect(getDependantLeafs(g, [1], [])).to.eql([]);
  });

  it('returns empty array if node has no deps', () => {
    const g = get1Graph();
    expect(getDependantLeafs(g, ['1'], ['1'])).to.eql(['1']);
  });

  it('returns deps from leaf with 1 dep', () => {
    const g = get2Graph();
    expect(getDependantLeafs(g, [2], [])).to.eql(['1']);
  });

  it('returns deps from leaf with 2 deps', () => {
    const g = get3Graph();
    expect(getDependantLeafs(g, [2], [])).to.eql(['1']);
  });

  it('returns deps from leaf with 2 layers of deps', () => {
    const g = get4Graph();
    expect(getDependantLeafs(g, [4], []).sort()).to.eql(['1', '3']);
  });

  it('returns deps for full graph', () => {
    const g = getFullGraph();
    expect(getDependantLeafs(g, [4], []).sort()).to.eql(['1', '3', '5']);
  });
});
