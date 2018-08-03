

/**
 * A class representing a complex number
 */
export class Complex{
  /**
   * Constructor. Takes the real an imaginary parts.
   * @param {number} real The real part of the complex number 
   * @param {number} [imaginary] The imaginary part
   */
  constructor(real, imaginary) {
    this.r = real;
    this.i = imaginary !== undefined ? imaginary: 0;
  }

  /**
   * The string representation of the complex number
   */
  toString() {
    if (!this.i) {
      return this.r.toString();
    }
    if (!this.r) {
      return this.i.toString() + 'i';
    }
    if (this.i > 0) {
      return this.r.toString() + ' + ' + this.i.toString() + 'i';
    } else {
      return this.r.toString() + ' - ' + (-this.i).toString() + 'i';
    }
  }

  /**
   * Return numeric representation of this complex number
   * Returns the real part if there is no imaginary part
   * or NaN if there is a non-zero imaginary component.
   * @returns {number} 
   */
  toValue() {
    if (!this.i) {
      return this.r;
    }
    return NaN;
  }

  /**
   * Add a complex number to this one and return the result as
   * a new complex number
   * @param {Complex|number} complex The complex number to add
   * @returns {Complex} A new complex number that is the result of the addition
   */
  add(complex) {
    if (typeof complex === 'number') {
      return new Complex(this.r + complex, this.i);
    }
    return new Complex(this.r + complex.r, this.i + complex.i);
  }

  /**
   * Subtract a complex number from this and return a new complex
   * number at the result
   * @param {Complex|number} complex
   * @returns {Complex} A new complex number that is the result of the subtraction
   */
  subtract(complex) {
    if (typeof complex === 'number') {
      return new Complex(this.r - complex, this.i);
    }
    return new Complex(this.r - complex.r, this.i - complex.i);
  }

  /**
   * Return complex which is the negative of this one
   * ie. apply unary minus
   * @returns {Complex}
   */
  negated() {
    return new Complex(-this.r, -this.i);
  }

  /**
   * Multiply this complex number by another and return the result
   * @param {Complex|number} complex
   * @returns {Complex} A new complex number that is the result
   */
  multiply(complex) {
    if (typeof complex === 'number') {
      return new Complex(this.r * complex, this.i * complex);
    }
    const real = this.r * complex.r - this.i * complex.i;
    const imaginary = this.r * complex.i + this.i * complex.r;
    return new Complex(real, imaginary);
  }

  /**
   * Return the conjugate of this complex number
   * The conjugate is the complex number with the same real
   * part and a negated imaginary part.
   * A complex times its conjugate is always a real number
   * with value equal to the magnitude squared.
   * This is important for doing complex divisions
   * @returns {Complex}
   */
  conjugate() {
    return new Complex(this.r, -this.i);
  }

  /**
   * Divide this complex number by another and return the result
   * @param {Complex|number} complex
   * @returns {Complex}
   */
  divide(complex) {
    if (typeof complex === 'number') {
      return new Complex(this.r/complex, this.i/complex);
    }
    // To do a complex division we must multiply
    // The top and bottom by the conjugate of the
    // denominator.
    return this.multiply(complex.conjugate()).divide(complex.magnitudeSquared());
  }


  /**
   * Multiply this complex number by itself
   * @returns {Complex} A new complex representing the result
   */
  squared() {
    return this.multiply(this);
  }

  /**
   * The "mangnitude" of the complex number as a vector in
   * complex space
   * @returns {number}
   */
  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  /**
   * For efficiency if is often better to compare aginst
   * the magnitude squared if the exact value of the magnitude
   * is not required.
   * eg. if (c.mangitudeSquared() > 4) // Quick
   *     if (c.magnitude() > 2) // Slow!
   * @returns {number}
   */
  magnitudeSquared() {
    return this.r * this.r + this.i * this.i;
  }

  /**
   * Return a new complex representing just the real component
   * of this complex number
   * @returns {Complex}
   */
  real() {
    return new Complex(this.r, 0);
  }

  /**
   * Return a new complex representing just the imaginary component
   * of this complex number
   * @returns {Complex}
   */
  imaginary() {
    return new Complex(0, this.i);
  }

  /**
   * Construct a complex from a real number
   * @param {number} r
   * @returns {Complex}
   */
  static real(r) {
    return new Complex(r);
  }

  /**
   * Construct a complex from the value of an imaginary number
   * @param {number} i 
   * @returns {Complex}
   */
  static imaginary(i) {
    return new Complex(0,i);
  }


  /**
   * Return a new complex number parsed from the string
   * @param {string} str
   * @returns {Complex} 
   */
  static fromString(str) {
    // Strip spaces
    str = str.replace(/\s/g,'');
    if (str[str.length - 1] !== 'i') {
      // It's real
      return Complex.real(Number(str));
    }
    const signs = str.match(/(?:[^eE])[+-]/g);
    if (!signs || signs.length === 0 || 
        str.lastIndexOf(signs[signs.length - 1]) === -1) {
      // It's imaginary. Parse without final 'i'
      return Complex.imaginary(Number(str.slice(0,-1)));
    }
    // It's complex
    // Split into real and imaginary parts
    const pos = str.lastIndexOf(signs[signs.length - 1]) + 1;
    const real = Number(str.slice(0,pos));
    const imaginary = Number(str.slice(pos,-1));
    return new Complex(real,imaginary);
  }

}
