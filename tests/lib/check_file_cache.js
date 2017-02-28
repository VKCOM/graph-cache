const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { loadTestFile, testSign, testGraph, loadCyclicGraph } = require('../utils/test_utils');

chai.use(chaiAsPromised);
const { expect } = chai;


const { checkFileCache } = require('../../lib/check_file_cache');

describe('checkFileCache', () => {
  it('returns false if cache is cold', () =>
    loadTestFile('1.txt').then(([file, filename]) => {
      const g = testGraph();
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.to.eql([filename]);
    })
  );

  it('returns false if file has no deps and signatures do not match', () =>
    loadTestFile('1.txt').then(([file, filename]) => {
      const g = testGraph();
      g.setNode(filename, 0);
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.eql([filename]);
    })
  );

  it('can check cycle graphs not changed', () =>
    loadCyclicGraph(true).then(([g, files, names]) => {
      return expect(checkFileCache(g, testSign, files[0], names[0]))
        .eventually.eql([]);
    })
  );


  it('can check cycle graphs changed', () =>
    loadCyclicGraph(true).then(([g, files, names]) => {
      g.setNode(names[1], 2123);
      return expect(checkFileCache(g, testSign, files[0], names[0]))
        .eventually.eql([names[1]]);
    })
  );

  it('returns true if file has no deps and signatures match', () =>
    loadTestFile('1.txt').then(([file, filename]) => {
      const sign = testSign(file);
      const g = testGraph();
      g.setNode(filename, sign);
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.eql([]);
    })
  );

  it('returns false if some deps are missing', () =>
    loadTestFile('1.txt').then(([file, filename]) => {
      const sign = testSign(file);
      const g = testGraph();
      g.setNode(filename, sign);
      g.setNode('some-file', 2);
      g.setEdge('some-file', filename);
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.eql(['some-file']);
    })
  );

  it('returns false if file has one dep and signatures do not match', () => {
    const files = Promise.all([loadTestFile('1.txt'), loadTestFile('2.txt')]);
    return files.then(([[file1, filename1], [file2, filename2]]) => {
      const g = testGraph();
      g.setNode(filename1, testSign(file1));
      g.setNode(filename2, testSign(file2) - 1);
      g.setEdge(filename2, filename1);
      return expect(checkFileCache(g, testSign, file1, filename1))
        .eventually.eql([filename2]);
    });
  });

  it('returns true if file has one dep and signatures match', () => {
    const files = Promise.all([loadTestFile('1.txt'), loadTestFile('2.txt')]);
    return files.then(([[file1, filename1], [file2, filename2]]) => {
      const g = testGraph();
      g.setNode(filename1, testSign(file1));
      g.setNode(filename2, testSign(file2));
      g.setEdge(filename2, filename1);
      return expect(checkFileCache(g, testSign, file1, filename1))
        .eventually.eql([]);
    });
  });
});
