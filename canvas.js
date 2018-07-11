var canvas; 
var ctx;
var balls = [];

var Ball = function(x,y,radius,color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;

  // Randomise velocities
  this.vx = (Math.random() * 2) -1;
  this.vy = (Math.random() * 2) -1;

  balls.push(this);

};
Ball.prototype.draw = function() {
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(this.x + this.radius, this.y);
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2, true);
  ctx.fill();
};
Ball.prototype.move = function() {
  this.x += this.vx;
  this.y += this.vy;

  // Check for collision with edge
  if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
    this.vx = - this.vx;
  }
  if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
    this.vy = - this.vy;
  }

  // Check for collisions with other balls
  for (var i=0; i<balls.length; ++i) {
    if (balls[i] === this || balls[i] in this.collisions) {
      continue;
    }
    var collide = doCollision(this, balls[i]);
    if (collide) {
      // Don't do this collision again when processing the other ball
      balls[i].collisions.push(this);
    }
  }
};
Ball.prototype.capVelocity = function() {
  var max = 5;
  if (this.vx > max) {
    this.vx = max;
  }
  if (this.vx < -max) {
    this.vx = -max;
  }
  if (this.vy > max) {
    this.vy = max;
  }
  if (this.vy < -max) {
    this.vy = -max;
  }
  // Move away from edges
  if (this.x < this.radius) {
    this.x = this.radius + 1;
  }
  if (this.y < this.radius) {
    this.y = this.radius + 1;
  }
  if (this.x > canvas.width - this.radius) {
    this.x = canvas.width - this.radius - 1;
  }
  if (this.y > canvas.height - this.radius) {
    this.y = canvas.height - this.radius - 1;
  }
};
Ball.resetCollisions = function() {
  for (var i=0; i<balls.length; ++i) {
    balls[i].collisions = [];
  }
};

var doCollision = function(ball1, ball2) {
  var dist = ball1.radius + ball2.radius;
  var dx = Math.abs(ball1.x - ball2.x);
  if (dx > dist) {
    // Collision not possible
    return false;
  }
  var dy = Math.abs(ball1.y - ball2.y);
  if (dy > dist) {
    // Collision not possible
    return false;
  }
  var between = Math.sqrt(dx*dx + dy*dy);
  var collide = between <= dist;
  if (collide) {
    var scalex = (ball2.x - ball1.x) / between;
    var scaley = (ball2.y - ball1.y) / between;
    // Calculate the velocity transfers
    var tx = (ball2.vx - ball1.vx) * scalex;
    var ty = (ball2.vy - ball1.vy) * scaley;
    //var tx2 = ball2.vx * scalex;
    //var ty2 = ball2.vy * scaley;
    // Set new velocities
    ball1.vx -= tx;
    ball1.vy -= ty;
    ball2.vx += tx;
    ball2.vy += ty;
    // Cap max velocities
    ball1.capVelocity();
    ball2.capVelocity();
    // Move appart
    var overlap = dist - between;
    ball2.x += (overlap / 2) * scalex;
    ball2.y += (overlap / 2) * scaley;
    ball1.x -= (overlap / 2) * scalex;
    ball1.y -= (overlap / 2) * scaley;
  }
  return collide;
};

var ball1 = new Ball(20,20,10,'red');
var ball2 = new Ball(120,120,10,'blue');
var ball3 = new Ball(60,90,10,'orange');
var ball4 = new Ball(90,50,10,'green');


var draw = function() {
  if (canvas === undefined) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
  }
  ctx.clearRect(0,0,canvas.width, canvas.height);
  Ball.resetCollisions();
  for (var i=0; i<balls.length; ++i) {
    balls[i].move();
    balls[i].draw();
  }
  setTimeout(draw, 20);
};

window.onload = draw;