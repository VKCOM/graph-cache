const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {loadTestFile, testSign, testGraph, verifyGraph} = require('../utils/test_utils');

chai.use(chaiAsPromised);
const {expect} = chai;


const {updateGraph} = require('../../lib/update_graph');

function getSimpleGraph(name, file, sign) {
  const g = testGraph();
  g.setNode(name, sign(file))
  return g;
}

function get2NodeGraph(name1, file1, name2, file2, sign) {
  const g = getSimpleGraph(name1, file1, sign);
  g.setNode(name2, sign(file2));
  g.setEdge(name2, name1);
  return g;
}

describe('updateGraph', () => {

  it('does not chang graph, if nothing was changed', () => {
    return loadTestFile('test.txt').then(([file, name]) => {
      const g = getSimpleGraph(name, file, testSign);
      return updateGraph(g, testSign, function(sign, file, name) {
        return Promise.resolve(getSimpleGraph(name, file, sign));
      }, file, name).then(g => {
        verifyGraph(g, [['test.txt', testSign(file)]], []);
      });
    });
  });

  it('changes node signature if it changed', () => {
    return loadTestFile('test.txt').then(([file, name]) => {
      const nwsig = testSign(file) + 1;
      const g = getSimpleGraph(name, file, testSign);
      return updateGraph(g, testSign, function(sign, file, name) {
        const nwg = getSimpleGraph(name, file, sign);
        nwg.setNode(name, nwsig);
        return Promise.resolve(nwg);
      }, file, name).then(g => {
        verifyGraph(g, [['test.txt', nwsig]], []);
      });
    });
  });

  it('adds new node if it appeared in graph', () => {
    const files = ['test.txt', 'test2.txt'].map(loadTestFile);
    return Promise.all(files).then(([[file1, name1], [file2, name2]]) => {
      const g = getSimpleGraph(name1, file1, testSign);
      return updateGraph(g, testSign, function(sign, file, name) {
        const nwg = get2NodeGraph(name1, file1, name2, file2, sign);
        return Promise.resolve(nwg);
      }, file1, name1).then(g => {
        verifyGraph(g, [
          ['test.txt', testSign(file1)],
          ['test2.txt', testSign(file2)]
        ], [
          { v: 'test2.txt', w: 'test.txt' }
        ]);
      });
    });
  });

  it('removes old node and edges if dep was remove', () => {
    const files = ['test.txt', 'test2.txt'].map(loadTestFile);
    return Promise.all(files).then(([[file1, name1], [file2, name2]]) => {
      const g = get2NodeGraph(name1, file1, name2, file2, testSign);
      return updateGraph(g, testSign, function(sign, file, name) {
        const nwg = getSimpleGraph(name1, file1, sign);
        return Promise.resolve(nwg);
      }, file1, name1).then(g => {
        verifyGraph(g, [
          ['test.txt', testSign(file1)]
        ], []);
      });
    });
  });

  it('changes graph structure if dependency graph changed', () => {
    const files = ['test.txt', 'test2.txt'].map(loadTestFile);
    return Promise.all(files).then(([[file1, name1], [file2, name2]]) => {
      const g = get2NodeGraph(name1, file1, name2, file2, testSign);
      return updateGraph(g, testSign, function(sign, file, name) {
        const nwg = get2NodeGraph(name2, file2, name1, file1, testSign);
        return Promise.resolve(nwg);
      }, file1, name1).then(g => {
        verifyGraph(g, [
          ['test.txt', testSign(file1)],
          ['test2.txt', testSign(file2)]
        ], [
          { v: 'test.txt', w: 'test2.txt' }
        ]);
      });
    });
  });

});
