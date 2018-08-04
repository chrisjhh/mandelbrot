import { Complex } from './complex';


/**
 * A class representing a box in complex space
 */
export class ComplexBox {
  /**
   * Construct a box in complex space
   * Takes a deep copy of values and adjusts corners
   * So min realy is the min and max the max
   * @param {Complex} min 
   * @param {Complex} max 
   * @param {number} [tol] The tolerance to use in tests [1e-6]
   */
  constructor(min,max,tol=1e-6) {
    const minr = Math.min(max.r, min.r);
    const maxr = Math.max(max.r, min.r);
    const mini = Math.min(max.i, min.i);
    const maxi = Math.max(max.i, min.i);
    this.min = new Complex(minr,mini);
    this.max = new Complex(maxr,maxi);
    this.tol = tol;
  }

  /**
   * Return the complex value at the parameter coodinates of the box
   * @param {number} r The proportion along the box along the real axis 0.0 -> 1.0
   * @param {number} i The proportion along the box along the imaginary axis 0.0 -> 1.0
   * @returns {Complex}
   */
  pointAt(r,i) {
    const to = this.max.subtract(this.min);
    return this.min.add(to.real().multiply(r)).add(to.imaginary().multiply(i));
  }

  /**
   * Return the midpoint of the box
   * @returns {Complex}
   */
  midPoint() {
    return this.min.add(this.max).divide(2);
  }


  /**
   * Check if this box is completely outside another box
   * @param {ComplexBox} box 
   */
  isOutside(box) {
    return (this.min.r > box.max.r - this.tol || this.max.r < box.min.r + this.tol ||
      this.min.i > box.max.i - this.tol || this.max.i < box.max.i + this.tol);
  }

  /**
   * Check if this box is completely inside another box
   * @param {ComplexBox} box 
   */
  isInside(box) {
    return (this.max.r < box.max.r + this.tol && this.min.r > box.min.r - this.tol &&
      this.max.i < box.max.i + this.tol && this.min.i > box.min.i - this.tol);
  }

  /**
   * Return if another box is completely inside this one
   * @param {*} box 
   */
  contains(box) {
    return (box.max.r < this.max.r + this.tol && box.min.r > this.min.r - this.tol &&
      box.max.i < this.max.i + this.tol && box.min.i > this.min.i - this.tol);
  }

  /**
   * Check if another box has any part of it inside this box
   * @param {ComplexBox} box 
   * @returns {boolean}
   */
  overlaps(box) {
    return !this.isOutside(box);
  }

  

}
