const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const {
  verifyGraph,
  load3Graph,
  load4Graph,
  testSign,
  load2Graph,
  compareGraphs,
  getName,
  loadTestFile,
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

  describe('#swapGraphs', () => {
    it('swaps old and next graph', () =>
      load2Graph().then(nwg =>
        createCacheGraph({}, testSign, {
          next: nwg,
        }).then(cache => {
          verifyGraph(cache._exposeGraph(), [], []);
          cache.swapGraphs();
          compareGraphs(cache._exposeGraph(), nwg);
        })
      )
    );

    it('not changes graph is next graph is empty', () =>
      load2Graph().then(nwg =>
        createCacheGraph({}, testSign, {
          g: nwg,
        }).then(cache => {
          compareGraphs(cache._exposeGraph(), nwg);
          cache.swapGraphs();
          compareGraphs(cache._exposeGraph(), nwg);
        })
      )
    );
  });

  describe('#checkFile', () => {
    it('returns false if file changed', () =>
      load2Graph().then(nwg =>
        createCacheGraph({}, testSign, {
          g: nwg,
        })
        .then(cache => cache.checkFile(new Buffer('test'), getName(1)))
        .then(answer => expect(answer).to.be.false)
      )
    );

    it('returns true if file didn\'t changed', () =>
      loadTestFile('1.txt').then(([file, name]) =>
        load2Graph().then(nwg =>
          createCacheGraph({}, testSign, {
            g: nwg,
          })
          .then(cache => cache.checkFile(file, name))
          .then(answer => expect(answer).to.be.true)
        )
      )
    );
  });

  describe('#getChangedLeafs', () => {
    it('returns empty array if nothing changed', () =>
      loadTestFile('1.txt').then(([file, name]) =>
        load2Graph().then(nwg =>
          createCacheGraph({}, testSign, {
            g: nwg,
          })
          .then(cache => cache.getChangedLeafs(file, name))
          .then(leafs => expect(leafs).to.eql([]))
        )
      )
    );

    it('returns array of change leafs if something changed', () =>
      loadTestFile('1.txt').then(([file, name]) =>
        load3Graph().then(nwg => {
          nwg.setNode(getName(2), '10');
          return createCacheGraph({}, testSign, {
            g: nwg,
          })
          .then(cache => cache.getChangedLeafs(file, name))
          .then(leafs => expect(leafs).to.eql([
            getName(1),
            getName(3),
          ]));
        })
      )
    );
  });
});
