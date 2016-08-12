# graph-cache

This library provides easy way to build and maintain dependency graph for any type of files/languges.
It provides a high-level set of operations on graph to fulfill common use cases, when working with dependency graphs.

```graph-cache``` is language agnostic, you can provide a parser for any type of files (JS, LESS, SASS, etc).

This library is built on top of the [graphlib](https://github.com/cpettitt/graphlib) npm package.

## Installation

```npm install --save graph-cache```

## Usage
```javascript
const createGraphCache = require('graph-cache');

const gcache = createGraphCache(parser, sign, {
  persistence: false
});

gcache.then((cache) => cache.checkFile(file, name));
```

API

### constructor
```javascript
const createGraphCache = require('graph-cache');
const gcache = createGraphCache(parser, sign, opts);
```

- parser — this is a function that takes a ```sign function```, file ```Buffer``` and file name.
```javascript
parser(sign, file, filename)
```

```Parser``` function should return ```Promise``` that resolves into full dependecy graph of given file as an instance of ```graphlib``` graph. Example of parser function is [graph-cache-less](https://github.com/VKCOM/graph-cache-less).

- sign — sign function, which takes ```Buffer``` and returns string (hash), that identifies this file, i.e. md5.
- opts — options object
```javascript
{
  persistence: 'test.txt', // string, file name where graph will be stored
  g: new Graph({ directed: true }), // initial graph, ignored if persistence is set
  targetFs: fs, // if you want to store graph in memory for some reasons
  cacheVersion: false, // this is the version, that should match the version stored in cache file, 
                       //if differs, cache will be discarded
}
```

Returns ```Promise```, that will resolve into ```Cache``` object.

### Cache object

It container cache API.

#### checkFile(file, filename)

This method allows tou to check whether this file or its deps has changed.

- file — ```Buffer``` with file contents
- filename — file name

Returns ```Promise``` that will reolve into false if file or its dependecies has changed, otherwise it will be resolved into true.

#### rebuildFromFile(file, filename)

This method allows you to update your cache with file and its dependecy subgraph and merge it to existing graph.
Changes won't take effect until you call ```swapGraphs```.

- file — ```Buffer``` with file contents
- filename — file name

#### getChangedLeafs(file, filename)

This method allows you to obtain all leaf-files, that depend on the given file.

- file — ```Buffer``` with file contents
- filename — file name

Returns ```Promise``` that will be resolved int list with leaf-file names.

#### saveGraph()

This method allows you to save graph to disk or target fs.

Returns ```Promise``` when saving is done.

#### swapGraphs()

When you call ```rebuildFromFile``` resulting graph is not yet used, until you call this method.
This is a way of ```commiting``` changes to your dependency graph.

Returns null

## Testing

This library is tested using ```Mocha``` and ```Chai```. You can run test suit with ```npm test```.
You can run ```npm run test-watch``` to rerun tests on file updates.

## Contributing

This library is written using ES6 code. 
Before pushing run ```npm run build``` to generate ES5 compatible js code.
Issues and PR's are welcomed here. 
