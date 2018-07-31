// Class representing a complex number
const Complex = function(real, imaginary) {
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
  let real = this.r * complex.r - this.i * complex.i;
  let imaginary = this.r * complex.i + this.i * complex.r;
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
    MandelbrotBox.calculations += 1;
    return;
  }
  if (value === null) {
    ctx.fillStyle = 'black';
  } else {
    value = value % 360;
    ctx.fillStyle = `hsl(${value},100%,50%)`;
  }
  ctx.fillRect(this.x,this.y,this.width,this.height);
  MandelbrotBox.calculations += 1;
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
  if (this.result || this.result === 0 || 
    (this.calculation && this.calculation.depth >= depth)) {
    //console.log("Shortcut calculation");
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
    MandelbrotBox.calculations += 1;
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
};

MandelbrotBox.drawFromQueue = function(ctx) {
  MandelbrotBox.calculations = 0;
  while (MandelbrotBox.calculations < 500 && 
    MandelbrotBox.drawQueue.length > 0 && !MandelbrotBox.paused) {
    const next = MandelbrotBox.drawQueue.shift();
    next.recursiveDraw(ctx);
  }
  if (MandelbrotBox.drawQueue.length > 0 && 
    !MandelbrotBox.paused) {
    setTimeout(() => MandelbrotBox.drawFromQueue(ctx), 0);
  }
};
MandelbrotBox.drawQueue = [];
MandelbrotBox.maxDepth = 720;

const canvasPosFromMouseEvent = function(e) {
  const canvas = document.getElementById('canvas');
  let pos = {};
  if (e.pageX || e.pageY) { 
    pos.x = e.pageX;
    pos.y = e.pageY;
  } else { 
    pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
    pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
  } 
  pos.x -= canvas.offsetLeft;
  pos.y -= canvas.offsetTop;
  return pos;
};


const drawOnCanvas = function() {
  const canvas = document.getElementById('canvas');
  //console.log(canvas);
  const ctx = canvas.getContext('2d');
  let c1 = new Complex(-1,1.2);
  let c2 = new Complex(2,-1.2);
  let box = new MandelbrotBox(0,0,canvas.width,canvas.height, c1, c2);
  MandelbrotBox.root = box;
  box.recursiveDraw(ctx);
  MandelbrotBox.drawFromQueue(ctx);

  canvas.onmousedown = mouseDown;
  canvas.onmousemove = mouseMove;
  canvas.onmouseup = mouseUp;
};

let imageSoFar;
let savedPos = {};
let mouseButtonDown = false;
const mouseDown = function(event) {
  if (event.button !== 0) {
    return;
  }
  mouseButtonDown = true;
  MandelbrotBox.pause = true;
  savedPos = canvasPosFromMouseEvent(event);
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  imageSoFar = ctx.getImageData(0,0,canvas.width,canvas.height);
};
const mouseMove = function(event) {
  if (!mouseButtonDown) {
    return;
  }
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const pos = canvasPosFromMouseEvent(event);
  const x1 = Math.min(savedPos.x, pos.x);
  const x2 = Math.max(savedPos.x, pos.x);
  const y1 = Math.min(savedPos.y, pos.y);
  const y2 = Math.max(savedPos.y, pos.y);
  ctx.putImageData(imageSoFar,0,0);
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.rect(x1,y1,x2-x1,y2-y1);
  ctx.stroke();
};
const mouseUp = function(event) {
  if (!mouseButtonDown || event.button !== 0) {
    return;
  }
  mouseButtonDown = false;
  MandelbrotBox.drawQueue = [];
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageSoFar,0,0);
  const pos = canvasPosFromMouseEvent(event);
  const x1 = Math.min(savedPos.x, pos.x);
  const x2 = Math.max(savedPos.x, pos.x);
  const y1 = Math.min(savedPos.y, pos.y);
  const y2 = Math.max(savedPos.y, pos.y);
  let c1 = MandelbrotBox.root.complexAtPoint(x1,y1);
  let c2 = MandelbrotBox.root.complexAtPoint(x2,y2);
  let box = new MandelbrotBox(0,0,canvas.width,canvas.height, c1, c2);
  let scale = canvas.width * canvas.height / ((x2 - x1) * (y2 - y1));
  if (Number.isNaN(scale) || scale <= 0) scale = 1;
  MandelbrotBox.maxDepth *= scale;
  MandelbrotBox.pause = false;
  MandelbrotBox.root = box;
  box.recursiveDraw(ctx);
  MandelbrotBox.drawFromQueue(ctx);
};


window.onload = drawOnCanvas;

const pause = function() {
  MandelbrotBox.paused = true;
};

const resume = function() {
  MandelbrotBox.paused = false;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  MandelbrotBox.drawFromQueue(ctx);
};

const restart = function() {
  MandelbrotBox.drawQueue = [];
  MandelbrotBox.paused = false;
  const canvas = document.getElementById('canvas');
  const  ctx = canvas.getContext('2d');
  MandelbrotBox.root.recursiveDraw(ctx);
  MandelbrotBox.drawFromQueue(ctx);
  const button = document.getElementById('button');
  button.innerHTML = 'Pause';
};

const togglePause = function() {
  const button = document.getElementById('button');
  if (MandelbrotBox.paused) {
    resume();
    button.innerHTML = 'Pause';
  } else {
    pause();
    button.innerHTML = 'Resume';
  }
};