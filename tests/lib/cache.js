const {expect} = require('chai');

const {createCacheStream} = require('../../lib/cache');

describe('Cache module', () => {
  it('exists', () => {
    expect(createCacheStream).not.to.be.a('undefined');
  });
});
