const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const {
  verifyGraph,
  load4Graph,
  testSign,
} = require('../utils/test_utils');

chai.use(chaiAsPromised);
const { expect } = chai;


const { createCacheGraph } = require('../../lib/cache');

describe('Cache module', () => {
  describe('loading module', () => {
    it('loads if no persistence', () => {
      const cache = createCacheGraph({}, testSign);
      expect(cache).to.eventually.be.an('object');
    });

    it('loads if persitence is set', () => {
      const cachep = createCacheGraph({}, testSign, {
        persistence: 'tests/fixtures/graph.json',
      });

      return cachep.then(cache => {
        const g = cache._exposeGraph();
        return load4Graph().then(nwg => {
          const sortedNodes = nwg.nodes().map(n => [n, nwg.node(n)]);
          const sortedEdges = nwg.edges();
          verifyGraph(g, sortedNodes, sortedEdges);
        });
      });
    });

    it('loads empty graph if no persitence file is found', () =>
      createCacheGraph({}, testSign, {
        persistence: 'tests/fixtures/graph111.json',
      }).then(cache => {
        const g = cache._exposeGraph();
        verifyGraph(g, [], []);
      })
    );
  });
});
