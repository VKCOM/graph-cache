const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { json } = require('graphlib');

const {
  verifyGraph,
  load3Graph,
  load4Graph,
  testSign,
  load2Graph,
  compareGraphs,
  getName,
  loadTestFile,
  testGraph,
  loadBigGraph,
} = require('../utils/test_utils');
const MemoryFileSystem = require('memory-fs');
const mfs = new MemoryFileSystem();
const fs = require('fs');

chai.use(chaiAsPromised);
const { expect } = chai;


const { createCacheGraph } = require('../../lib/cache');

describe('Cache module', () => {
  describe('loading module', () => {
    it('loads if no persistence', () => {
      const cache = createCacheGraph({}, testSign);
      expect(cache).to.eventually.be.an('object');
    });

    it('ignores persistent cache if cacheVersion is different', () => {
      const cachep = createCacheGraph({}, testSign, {
        persistence: 'tests/fixtures/graph_v.json',
        cacheVersion: 2,
      });

      return cachep.then(cache => {
        const g = cache._exposeGraph();
        verifyGraph(g, [], []);
      });
    });

    it('loads if persitence is set and cacheVersion is the same', () => {
      const cachep = createCacheGraph({}, testSign, {
        persistence: 'tests/fixtures/graph_v.json',
        cacheVersion: 1,
      });

      return cachep.then(cache => {
        const g = cache._exposeGraph();
        return load4Graph().then(nwg => {
          compareGraphs(g, nwg);
        });
      });
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
      load2Graph().then(nwg => {
        const lp = createCacheGraph({}, testSign, {
          next: nwg,
        });
        lp.then(cache => {
          verifyGraph(cache._exposeGraph(), [], []);
          cache.swapGraphs();
        });
        return lp.then(cache => {
          compareGraphs(cache._exposeGraph(), nwg);
        });
      })
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

  describe('#saveGraph', () => {
    it('saves graph to fs', () =>
      load3Graph().then(nwg =>
        createCacheGraph({}, testSign, {
          g: nwg,
          persistence: '/test.json',
          targetFs: mfs,
          cacheVersion: 15,
        }).then(cache =>
          cache.saveGraph(mfs)
        ).then(() => {
          const gf = mfs.readFileSync('/test.json');
          const gjson = JSON.parse(gf.toString());
          const g = json.read(gjson.graph);
          expect(gjson.cacheVersion).to.equal(15);
          compareGraphs(g, nwg);
        })
      )
    );
  });

  describe('#visualise', () => {
    it('generates cytoscape format for given graph', () =>
      load2Graph().then(nwg => {
        const gf = createCacheGraph({}, testSign, { g: nwg });
        return gf.then((cache) => {
          expect(cache._toCytoScape()).to.eql([
            { data: { id: 'tests/fixtures/1.txt' } },
            { data: { id: 'tests/fixtures/2.txt' } },
            { data: {
              id: 'tests/fixtures/2.txt_tests/fixtures/1.txt',
              source: 'tests/fixtures/2.txt',
              target: 'tests/fixtures/1.txt' } }
          ]);
        });
      })
    );

    it('generates html file with cytoscape', () =>
      loadBigGraph().then(nwg => {
        const gf = createCacheGraph({}, testSign, { g: nwg });
        return gf.then((cache) => {
          return cache.visualise('tests/fixtures/visual.html').then(() => {
            return new Promise((res, rej) => {
              fs.readFile('tests/fixtures/visual.html', (err, data) => {
                if (err) {
                  rej(err);
                }
                res(data.toString().length);
              });
            }).then((len) => {
              expect(len).to.be.gte(0);
            });
          });
        });
      })
    );
  });

  describe('#rebuildFromFile', () => {
    it('adds subgraph to empty graph', () =>
      loadTestFile('1.txt').then(([file, name]) =>
        load3Graph().then(nwg => {
          nwg.removeEdge(getName(2), getName(3));
          nwg.setEdge(getName(3), getName(2));
          const gf = createCacheGraph(() => Promise.resolve(nwg), testSign, {});
          return gf.then(cache => cache.rebuildFromFile(file, name))
            .then(() => gf)
            .then(cache => {
              const next = cache._exposeNextGraph();
              const g = cache._exposeGraph();
              compareGraphs(g, testGraph());
              compareGraphs(next, nwg);
            });
        })
      )
    );
  });
});
