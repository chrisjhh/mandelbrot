const chai = require('chai');
const expect = chai.expect;

import { Complex } from '../lib/complex';

describe('Complex', function() {
  it('constructor', function() {
    let complex = new Complex(3,2);
    expect(complex.r).to.equal(3);
    expect(complex.i).to.equal(2);
    expect(complex).to.deep.equal({r:3,i:2});
  });
});