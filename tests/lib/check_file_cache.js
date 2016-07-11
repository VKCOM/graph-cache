const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { loadTestFile, testSign, testGraph } = require('../utils/test_utils');

chai.use(chaiAsPromised);
const { expect } = chai;


const { checkFileCache } = require('../../lib/check_file_cache');

describe('checkFileCache', () => {
  it('returns false if cache is cold', () =>
    loadTestFile('test.txt').then(([file, filename]) => {
      const g = testGraph();
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.to.eql([filename]);
    })
  );

  it('returns false if file has no deps and signatures do not match', () =>
    loadTestFile('test.txt').then(([file, filename]) => {
      const g = testGraph();
      g.setNode(filename, 0);
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.eql([filename]);
    })
  );


  it('returns true if file has no deps and signatures match', () =>
    loadTestFile('test.txt').then(([file, filename]) => {
      const sign = testSign(file);
      const g = testGraph();
      g.setNode(filename, sign);
      return expect(checkFileCache(g, testSign, file, filename))
        .eventually.eql([]);
    })
  );

  it('returns false if file has one dep and signatures do not match', () => {
    const files = Promise.all([loadTestFile('test.txt'), loadTestFile('test2.txt')]);
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
    const files = Promise.all([loadTestFile('test.txt'), loadTestFile('test2.txt')]);
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
