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
  let value = this.calculate(MandelbrotBox.maxDepth);
  if (this.parent && value === this.parent.result) {
    // No need to draw subbox of same clour as parent
    return;
  }
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
  return this.c1.add(dc.real().multiply(dx/this.width)).add(dc.imaginary().multiply(dy/this.height));
};
MandelbrotBox.prototype.subBoxes = function() {
  if (this._subboxes) {
    return this._subboxes;
  }
  this._subboxes = [];
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
      const box = new MandelbrotBox(ix,iy,w,h,nc1,nc2);
      box.parent = this;
      this._subboxes.push(box);
    }
  }
  return this._subboxes;
};
MandelbrotBox.prototype.calculate = function(depth) {
  // Return cached result if already calculated
  if (this.result || 
    (this.calculation && this.calculation.depth >= depth)) {
    return this.result;
  }
  if (!this.calculation) {
    this.calculation = {};
    this.calculation.c0 = this.c1.add(this.c2).multiply(0.5);
    this.calculation.depth = 0;
    this.calculation.cn = this.calculation.c0;
  }
  
  while (this.calculation.cn.magnitudeSquared() < 4) {
    ++this.calculation.depth;
    if (this.calculation.depth >= depth) {
      this.result = null;
      return this.result;
    } 
    this.calculation.cn = this.calculation.cn
      .squared().subtract(this.calculation.c0);
  }
  this.result = this.calculation.depth;
  // Done with calculations now
  delete this.calculation;

  return this.result;
};

MandelbrotBox.prototype.recursiveDraw = function(ctx) {
  this.draw(ctx);
  if (this.width > 1 || this.height > 1) {
    let boxes = this.subBoxes();
    for (let b of boxes) {
      MandelbrotBox.drawQueue.push(b);
    }
  }
  if (MandelbrotBox.drawQueue.length > 0) {
    if (!MandelbrotBox.paused) {
      const next = MandelbrotBox.drawQueue.shift();
      setTimeout(() => {next.recursiveDraw.bind(next)(ctx);}, 0);
    }
  }
};
MandelbrotBox.drawQueue = [];
MandelbrotBox.maxDepth = 720;


var drawOnCanvas = function() {
  var canvas = document.getElementById('canvas');
  //console.log(canvas);
  var ctx = canvas.getContext('2d');
  var c1 = new Complex(-1,1.2);
  var c2 = new Complex(2,-1.2);
  var box = new MandelbrotBox(0,0,canvas.width,canvas.height, c1, c2);
  MandelbrotBox.root = box;
  box.recursiveDraw(ctx);
};

window.onload = drawOnCanvas;

const pause = function() {
  MandelbrotBox.paused = true;
};

const resume = function() {
  MandelbrotBox.paused = false;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  if (MandelbrotBox.drawQueue.length > 0) {
    const next = MandelbrotBox.drawQueue.shift();
    next.recursiveDraw(ctx);
  }
};

const restart = function() {
  MandelbrotBox.drawQueue = [];
  MandelbrotBox.paused = false;
  const canvas = document.getElementById('canvas');
  const  ctx = canvas.getContext('2d');
  MandelbrotBox.root.recursiveDraw(ctx);
};