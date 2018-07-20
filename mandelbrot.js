// Class representing a complex number
var Complex = function(real, imaginary) {
  this.r = real;
  this.i = imaginary !== undefined ? imaginary: 0;
};
Complex.prototype.toString = function() {
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
Complex.prototype.real = function() {
  return new Complex(this.r, 0);
};
Complex.prototype.imaginary = function() {
  return new Complex(0, this.i);
};

const MandelbrotBox = function(x,y,width,height,c1,c2) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.c1 = c1;
  this.c2 = c2;
};
MandelbrotBox.prototype.draw = function(ctx) {
  const cmid = this.c1.add(this.c2).multiply(0.5);
  let value = mandelbrot(cmid);
  if (value === null) {
    ctx.fillStyle = 'black';
  } else {
    value = value % 360;
    ctx.fillStyle = `hsl(${value},100%,50%)`;
  }
  ctx.fillRect(this.x,this.y,this.width,this.height);
};
MandelbrotBox.prototype.complexAtPoint = function(x,y) {
  const dx = x - this.x;
  const dy = y - this.y;
  const dc = this.c2.subtract(this.c1);
  return this.c1.add(dc.real().multiply(dx/this.width)).add(dc.imaginary().multiply(dy/this.width));
};
MandelbrotBox.prototype.subBoxes = function() {
  let boxes = [];
  let dx = this.width / 3;
  if (dx < 1) {
    dx = 1;
  }
  let dy = this.height / 3;
  if (dy < 1) {
    dy = 1;
  }
  for (let x=this.x; x<this.x+this.width; x+=dx) {
    let ix = Math.floor(x);
    let w = Math.floor(x + dx - ix);
    for (let y=this.y; y<this.y+this.height; y+=dy) {
      let iy = Math.floor(y);
      let h = Math.floor(y + dy - iy);
      let nc1 = this.complexAtPoint(ix,iy);
      let nc2 = this.complexAtPoint(ix+dx,iy+dy);
      boxes.push(new MandelbrotBox(ix,iy,w,h,nc1,nc2));
    }
  }
  return boxes;
};

var mandelbrot = function(complex) {
  var iteration = 0;
  var c0 = complex;
  var cn = c0;
  while (cn.magnitudeSquared() < 4) {
    ++iteration;
    if (iteration >= 400) {
      //console.log("mandelbrot(" + complex + ") -> null");
      return null;
    } 
    cn = cn.squared().subtract(c0);
  }
  //console.log("mandelbrot(" + complex + ") -> " + iteration);
  return iteration;
};

var draw = function(ctx,box) {
  box.draw(ctx);
  if (box.width > 1 || box.height > 1) {
    let boxes = box.subBoxes();
    for (let b of boxes) {
      setTimeout(() => {draw(ctx,b);}, 0);
    }
  }
};

var drawOnCanvas = function() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var c1 = new Complex(-1,1.2);
  var c2 = new Complex(2,-1.2);
  var box = new MandelbrotBox(0,0,canvas.width,canvas.height, c1, c2);
  draw(ctx,box);
};

window.onload = drawOnCanvas;