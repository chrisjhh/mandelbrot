// Class representing a complex number
var Complex = function(real, imaginary) {
  this.r = real;
  this.i = imaginary !== undefined ? imaginary: 0;
};
Complex.prototype.add = function(complex) {
  if (typeof complex === 'number') {
    return new Complex(this.r + complex, this.i);
  }
  return new Complex(this.r + complex.r, this.i + complex.i);
};
Complex.prototype.subtract = function(complex) {
  if (typeof complex === 'number') {
    return new Complex(this.r - complex, this.i);
  }
  return new Complex(this.r - complex.r, this.i - complex.i);
};
Complex.prototype.multiply = function(complex) {
  if (typeof complex === 'number') {
    return new Complex(this.r * complex, this.i * complex);
  }
  var real = this.r * complex.r - this.i * complex.i;
  var imaginary = this.r * complex.i + this.i * complex.r;
  return new Complex(real, imaginary);
};
Complex.prototype.squared = function() {
  return this.multiply(this);
};
Complex.prototype.magnitude = function() {
  return Math.sqrt(this.magnitudeSquared());
};
Complex.prototype.magnitudeSquared = function() {
  return this.r * this.r + this.i * this.i;
};

var mandelbrot = function(complex) {
  var iteration = 0;
  var c0 = complex;
  var cn = c0;
  while (cn.magnitudeSquared() < 4) {
    ++iteration;
    if (iteration >= 400) {
      return null;
    } 
    cn = cn.squared().minus(c0);
  }
  return iteration;
};

var draw = function(ctx,x1,y1,x2,y2,c1,c2) {
  // Complex number in middle of range
  var cmid = c1.add(c2).multiply(0.5);
  var value = mandelbrot(cmid);
  if (value === null) {
    ctx.fillStyle = 'black';
  } else {
    value = value % 360;
    ctx.fillStyle = `hsl(${value},100%,100%)`;
  }
  var width = x2 - x1;
  var height = y2 - y1;
  ctx.fillRect(x1,y1,width,height);
  // If size of canvas is  > 1, fire off events to give better resolution
  if (width == 1 && height == 1) {
    return;
  }
  var dx = Math.floor(width / 3);
  var dy = Math.floor(height / 3);
  var dc = c2.minus(c1);
  if (dx > 0 && dy > 0) {
    for (var i=0; i< 3; ++i) {
      var nx1 = x1 + dx * i;
      var nx2 = i === 2 ? x2 : nx1 + dx;
      var nc1r = c1.r + dc.r * i;
      var nc2r = nc1r + dc.r;
      for (var j=0; j<3; ++j) {
        // Don't do middle square - already calculated
        if (i === 1 && j === 1) {
          continue;
        }
        var ny1 = y1 + dy * j;
        var ny2 = j === 2 ? y2 : ny1 + dy;
        var nc1i = c1.i + dc.i * j;
        var nc2i = nc1i + dc.i;
        var nc1 = new Complex(nc1r, nc1i);
        var nc2 = new Complex(nc2r, nc12);
        setTimeout(function() {
          draw(ctx,nx1,ny1,nx2,ny2,nc1,nc2);
        },0);
      }
    }
  } else {
    for (var i=0; i<width; ++i) {
      var nr1 = c1.r + dc.r * i;
      var nr2 = nr1 + dc.r;
      for (var j=0; j<height; ++j) {
        var ni1 = c1.i + dc.i * i;
        var ni2 = ni1 + dc.i;
        var nc1 = new Complex(nr1, ni1);
        var nc2 = new Complex(nr2, ni2);
        setTimeout(function() {
          draw(ctx,x1+i,y1+j,x1+i+1,y1+j+1,nc1,nc2);
        },0);
      }
    }
  }
}

var drawOnCanvas = function() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  var c1 = new Complex(-2,2);
  var c2 = new Complex(2,-2);
  draw(ctx,0,0,canvas.width,canvas.heigth, c1, c2);
};

window.onload = drawOnCanvas();