const chai = require('chai');
const expect = chai.expect;

const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

import { Complex } from '../lib/complex';
import { ComplexBox } from '../lib/complexbox';

describe.only('ComplexBox', function() {
  it('constructor', function() {
    const c1 = new Complex(-1,2);
    const c2 = new Complex(2,-1);
    const box = new ComplexBox(c1,c2);
    expect(box).to.deep.equal(new ComplexBox(c2,c1));
    expect(box.min).to.deep.equal({r:-1,i:-1});
    expect(box.max).to.deep.equal({r:2,i:2});
  });

  it('pointAt', function() {
    const c1 = new Complex(-2,-2);
    const c2 = new Complex(2,2);
    const box = new ComplexBox(c1,c2);
    expect(box.pointAt(0.25,0.75)).to.deep.equal({r:-1,i:1});
    expect(box.pointAt(1,0)).to.deep.equal({r:2,i:-2});
  });

  it('midPoint', function() {
    const c1 = new Complex(-1,-2);
    const c2 = new Complex(2,1);
    const box = new ComplexBox(c1,c2);
    expect(box.midPoint()).to.deep.equal(box.pointAt(0.5,0.5));
    expect(box.midPoint()).to.deep.equal({r:0.5,i:-0.5});
  });
});