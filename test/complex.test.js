const chai = require('chai');
const expect = chai.expect;

const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

import { Complex } from '../lib/complex';

describe('Complex', function() {
  it('constructor', function() {
    let complex = new Complex(3,2);
    expect(complex.r).to.equal(3);
    expect(complex.i).to.equal(2);
    expect(complex).to.deep.equal({r:3,i:2});
  });

  it('toString', function() {
    expect(new Complex(2,3).toString()).to.equal('2 + 3i');
    expect(new Complex(2.7,3.5).toString()).to.equal('2.7 + 3.5i');
    expect(new Complex(2.7,-3.5).toString()).to.equal('2.7 - 3.5i');
    expect(new Complex(-2.7,3.5).toString()).to.equal('-2.7 + 3.5i');
    expect(new Complex(-2.7,-3.5).toString()).to.equal('-2.7 - 3.5i');
    expect(new Complex(2.7).toString()).to.equal('2.7');
    expect(new Complex(-2.7).toString()).to.equal('-2.7');
    expect(new Complex(0,3.5).toString()).to.equal('3.5i');
    expect(new Complex(0,-3.5).toString()).to.equal('-3.5i');
  });

  it('toValue', function() {
    expect(new Complex(2.7).toValue()).to.equal(2.7);
    expect(new Complex(2.7,3.5).toValue()).to.be.NaN;
    expect(new Complex(0,3.5).toValue()).to.be.NaN;
  });

  it('comparisons', function() {
    expect(new Complex(2.7) == 2.7).to.be.true;
    expect(new Complex(2.7) == '2.7').to.be.true;
    expect(new Complex(2.7,3.5) == 2.7).to.be.false;
    expect(new Complex(2.7,3.5) == '2.7').to.be.false;
    expect(new Complex(2.7,3.5) == '2.7 + 3.5i').to.be.true;
    expect(new Complex(0,3.5) == '3.5i').to.be.true;
  });

  it('add', function() {
    const c1 = new Complex(2.7,3.5);
    const c2 = new Complex(1.2, -2.1);
    expect(c1.add(c2)).to.deep.equal(c2.add(c1));
    expect(c1.add(c2)).to.deep.almost(new Complex(3.9, 1.4));
  });

  it('subtract', function() {
    const c1 = new Complex(2.7,3.5);
    const c2 = new Complex(1.2, -2.1);
    expect(c1.subtract(c2)).to.deep.equal(c2.negated().add(c1));
    expect(c1.subtract(c2)).to.deep.almost(new Complex(1.5, 5.6));
  });

  it('multiply', function() {
    const c1 = new Complex(2.7,3.5);
    const c2 = new Complex(1.2, -2.1);
    expect(c2.multiply(2)).to.deep.almost(new Complex(2.4,-4.2));
    expect(c1.multiply(c2)).to.deep.equal(c2.multiply(c1));
    expect(c1.multiply(c2)).to.deep.almost({r:10.59,i:-1.47});
  });

  it('conjugate', function() {
    expect(new Complex(2.7,3.5).conjugate())
      .to.deep.equal({r:2.7, i:-3.5});
  });

  it('divide', function() {
    const c1 = new Complex(2.7,3.5);
    const c2 = new Complex(1.2, -2.1);
    expect(c2.divide(2)).to.deep.almost(new Complex(0.6,-1.05));
    expect(c1.divide(c2).multiply(c2)).to.deep.almost(c1);
    expect(c1.divide(c2)).to.deep.almost({r:-0.70256410,i:1.6871795});
  });

  it('squared', function() {
    const c1 = new Complex(2.7,3.5);
    expect(c1.squared()).to.deep.equal(c1.multiply(c1));
  });

  it('magnitude', function() {
    expect(new Complex(3,4).magnitude()).to.almost(5);
  });

  it('magnitudeSquared', function() {
    expect(new Complex(3,4).magnitudeSquared()).to.equal(25);
  });

  it('real', function() {
    expect(new Complex(2.7,3.5).real())
      .to.deep.equal({r:2.7, i:0});
  });

  it('imaginary', function() {
    expect(new Complex(2.7,3.5).imaginary())
      .to.deep.equal({r:0, i:3.5});
  });

  it('static real', function() {
    expect(Complex.real(2.7))
      .to.deep.equal({r:2.7, i:0});
  });

  it('static imaginary', function() {
    expect(Complex.imaginary(3.5))
      .to.deep.equal({r:0, i:3.5});
  });

  it('fromString', function() {
    expect(Complex.fromString('2.7'))
      .to.deep.equal({r:2.7,i:0});
    expect(Complex.fromString('3.5i'))
      .to.deep.equal({r:0,i:3.5});
    expect(Complex.fromString('2.7 + 3.5i'))
      .to.deep.equal({r:2.7,i:3.5});
    expect(Complex.fromString('2.7 - 3.5i'))
      .to.deep.equal({r:2.7,i:-3.5});
    expect(Complex.fromString('-2.7 - 3.5i'))
      .to.deep.equal({r:-2.7,i:-3.5});
    expect(Complex.fromString('-2.7e-3 - 3.53e-2i'))
      .to.deep.equal({r:-0.0027,i:-0.035});
    const c1 = new Complex(1.343547456, 345454353.44);
    expect(Complex.fromString(c1.toString()))
      .to.deep.almost(c1);
    expect(Complex.fromString('orange'))
      .to.deep.equal({r:NaN, i:NaN});
  });

});