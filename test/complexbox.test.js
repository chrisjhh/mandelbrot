const chai = require('chai');
const expect = chai.expect;

const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

import { Complex } from '../lib/complex';
import { ComplexBox } from '../lib/complexbox';

describe('ComplexBox', function() {
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

  it('isOutside', function() {
    const c1 = new Complex(-2,-2);
    const c2 = new Complex(2,2);
    const box1 = new ComplexBox(c1,c2);
    expect(new ComplexBox({r:-4,i:-2},{r:-2.5,i:2}).isOutside(box1)).to.be.true;
    expect(new ComplexBox({r:4,i:-2},{r:6,i:2}).isOutside(box1)).to.be.true;
    expect(new ComplexBox({r:-2,i:-4},{r:2,i:-3.5}).isOutside(box1)).to.be.true;
    expect(new ComplexBox({r:-2,i:2.5},{r:2,i:4}).isOutside(box1)).to.be.true;
    expect(new ComplexBox({r:-1,i:-1},{r:1,i:1}).isOutside(box1)).to.be.false;
    expect(new ComplexBox({r:-2,i:-1},{r:1,i:1}).isOutside(box1)).to.be.false;
    // Touching
    expect(new ComplexBox({r:-3,i:-2},{r:-2,i:2}).isOutside(box1)).to.be.true;
    // Touching within tol
    expect(new ComplexBox({r:-3,i:-2},{r:-2 + 1e-8,i:2}).isOutside(box1)).to.be.true;
    // Overlap by more than tol
    expect(new ComplexBox({r:-3,i:-2},{r:-2 + 1e-3,i:2}).isOutside(box1)).to.be.false;
  });
});