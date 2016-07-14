const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { loadTestFile, testSign, testGraph, verifyGraph, createPath } = require('../utils/test_utils');

chai.use(chaiAsPromised);

const { updateGraph } = require('../../lib/update_graph');

function loadFiles(...files) {
  return Promise.all(files.map(el => loadTestFile(el.toString() + '.txt')));
}

function getName(num) {
  return createPath(num.toString() + '.txt');
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
  return load2Graph(true).then(([g, files, names]) => {
    return loadFiles(3).then(([[file, name]]) => {
      g.setNode(name, testSign(file));
      g.setEdge(getName(2), name);
      if (info) {
        return [g, files.concat([file]), names.concat(name)];
      }
      return g;
    });
  });
}

function load3Graph4(info = false) {
  return load2Graph(true).then(([g, files, names]) => {
    return loadFiles(4).then(([[file, name]]) => {
      g.setNode(name, testSign(file));
      g.setEdge(name, getName(1));
      if (info) {
        return [g, files.concat([file]), names.concat(name)];
      }
      return g;
    });
  });
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

describe('updateGraph', () => {
  it('does not change graph, if nothing was changed', () =>
    load2Graph(true).then(([g, files, names]) =>
      updateGraph(g, testSign, () => load2Graph(), '', getName(1))
        .then(nwg =>
          verifyGraph(nwg, [
            [names[0], testSign(files[0])],
            [names[1], testSign(files[1])],
          ], [
            { v: names[1], w: names[0] },
          ]
        )
      )
    )
  );

  it('changes node signature if it changed', () =>
    load2Graph(true).then(([g, files, names]) =>
      updateGraph(g, testSign, () =>
        load2Graph().then(ng => {
          ng.setNode(names[1], testSign(files[1]) + 1);
          return ng;
        })
      , '', getName(1))
        .then(nwg =>
          verifyGraph(nwg, [
            [names[0], testSign(files[0])],
            [names[1], testSign(files[1]) + 1],
          ], [
            { v: names[1], w: names[0] },
          ]
        )
      )
    )
  );

  it('adds new node if it appeared in graph', () => {
    return loadFiles(4).then(([[file4, name4]]) => {
      return load3Graph(true).then(([g, files, names]) => {
        return updateGraph(g, testSign, () => load3Graph4(), '', getName(1))
          .then(nwg =>
            verifyGraph(nwg, [
              [names[0], testSign(files[0])],
              [names[1], testSign(files[1])],
              [names[2], testSign(files[2])],
              [name4, testSign(file4)],
            ], [
              { v: names[1], w: names[0] },
              { v: names[1], w: names[2] },
              { v: name4, w: names[0] },
            ]
          )
        );
      });
    });
  });

  it('removes old node and edges if dep was remove', () => {
    return load4Graph(true).then(([g, files, names]) => {
      return updateGraph(g, testSign, () => load2Graph(), '', getName(1))
        .then(nwg =>
          verifyGraph(nwg, [
            [names[0], testSign(files[0])],
            [names[1], testSign(files[1])],
            [names[2], testSign(files[2])],
          ], [
            { v: names[1], w: names[0] },
            { v: names[1], w: names[2] },
          ]
        )
      );
    });
  });

  it('changes graph structure if dependency graph changed', () => {
    return load3Graph(true).then(([g, files, names]) => {
      g.removeEdge(getName(2), getName(3));
      g.setEdge(getName(3), getName(1));
      return updateGraph(g, testSign, () => load3Graph().then(nwg => {
        nwg.removeEdge(getName(2), getName(3));
        nwg.setEdge(getName(3), getName(2));
        return nwg;
      }), '', getName(1))
        .then(nwg =>
          verifyGraph(nwg, [
            [names[0], testSign(files[0])],
            [names[1], testSign(files[1])],
            [names[2], testSign(files[2])],
          ], [
            { v: names[1], w: names[0] },
            { v: names[2], w: names[1] },
          ]
        )
      );
    });
  });

  it('if subgraph is empty, will remove only leaf', () => {
    return load3Graph(true).then(([g, files, names]) => {
      return updateGraph(g, testSign, () => Promise.resolve(testGraph()), '', getName(1))
        .then(nwg =>
          verifyGraph(nwg, [
            [names[1], testSign(files[1])],
            [names[2], testSign(files[2])],
          ], [
            { v: names[1], w: names[2] },
          ]
        )
      );
    });
  });

  it('if subgraph is empty, will remove leaf and nodes with no connection', () => {
    return load2Graph(true).then(([g, files, names]) => {
      return updateGraph(g, testSign, () => Promise.resolve(testGraph()), '', getName(1))
        .then(nwg =>
          verifyGraph(nwg, [], [])
        );
    });
  });
});
