var canvas; 
var ctx;
var balls = [];

var Point = function(x,y) {
  this.x = x;
  this.y = y;
};
Point.prototype.vectorTo = function(point) {
  return new Vector(point.x - this.x, point.y - this.y);
};
Point.prototype.displacedBy = function(vector) {
  return new Point(this.x + vector.x, this.y + vector.y);
};
Point.prototype.displace = function(vector) {
  this.x += vector.x;
  this.y += vector.y;
  return this;
};

var Vector = function(x,y) {
  Point.call(this, x, y);
}
Vector.prototype = Object.create(Point.prototype);
Vector.prototype.constructor = Vector;
Vector.prototype.vectorTo = undefined;
Vector.prototype.displacedBy = undefined;
Vector.prototype.displace = undefined;
Vector.prototype.add = function(vector) {
  return new Vector(this.x + vector.x, this.y + vector.y);
};
Vector.prototype.subtract = function(vector) {
  return new Vector(this.x - vector.x, this.y - vector.y);
};
Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
Vector.prototype.unit = function() {
  var mag = this.magnitude();
  return new Vector(this.x / mag, this.y / mag);
};
Vector.prototype.scale = function(scale) {
  this.x *= scale;
  this.y *= scale;
  return this;
};
Vector.prototype.scaledBy = function(scale) {
  return new Vector(this.x * scale, this.y * scale);
};
Vector.prototype.dotProduct = function(vector) {
  return this.x * vector.x + this.y * vector.y;
}
Vector.prototype.reversed = function() {
  return new Vector(-this.x, -this.y);
};



var Ball = function(x,y,radius,color) {
  Point.call(this, x, y);
  this.radius = radius;
  this.color = color;

  // Mass is proportional to the cube of the radius
  this.mass = radius * radius * radius;

  // Randomise velocities
  this.velocity = new Vector(
    (Math.random() * 2) -1,
    (Math.random() * 2) -1
  );

  balls.push(this);

};
Ball.prototype = Object.create(Point.prototype);
Ball.prototype.constructor = Ball;
Ball.prototype.draw = function() {
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(this.x + this.radius, this.y);
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2, true);
  ctx.fill();
};
Ball.prototype.move = function() {
  this.displace(this.velocity);

  // Check for collision with edge
  if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
    this.velocity.x = - this.velocity.x;
  }
  if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
    this.velocity.y = - this.velocity.y;
  }

  // Check for collisions with other balls
  for (var i=0; i<balls.length; ++i) {
    if (balls[i] === this || balls[i] in this.collisions) {
      continue;
    }
    var collide = doCollision(this, balls[i]);
    var collide = false;
    if (collide) {
      // Don't do this collision again when processing the other ball
      balls[i].collisions.push(this);
    }
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
Ball.prototype.capVelocity = function() {
  var max = 5;
  var mag = this.velocity.magnitude();
  if (mag > max) {
    this.velocity.scale(max/mag);
  }
};
Ball.resetCollisions = function() {
  for (var i=0; i<balls.length; ++i) {
    balls[i].collisions = [];
  }
};

var doCollision = function(ball1, ball2) {
  var dist = ball1.radius + ball2.radius;
  var between = ball1.vectorTo(ball2);
  if (between.x > dist || between.y > dist) {
    // Collision not possible
    return false;
  }
  var distBetween = between.magnitude();
  var collide = distBetween <= dist;
  if (collide) {

    // Get the closing velocity of ball1 on ball2
    var closingVelocity = ball1.velocity.subtract(ball2.velocity);

    // Project this along directon of contact
    var contactDir = between.unit();
    var scale = closingVelocity.dotProduct(contactDir);
    var transfer = contactDir.scaledBy(scale);

    // Amount of velocity tansfered depends on ratio of mass
    var massRatio = ball2.mass / ball1.mass;
    var b2scale = 2 / ( 1 + massRatio);
    var transfer2 = transfer.scaledBy(b2scale);
    var transfer1 = transfer2.scaledBy(massRatio);

    // Transfer this velocity from ball1 to ball2
    ball1.velocity = ball1.velocity.subtract(transfer1);
    ball2.velocity = ball2.velocity.add(transfer2);

    // Cap max velocities
    ball1.capVelocity();
    ball2.capVelocity();
    // Move appart
    var overlap = dist - distBetween + 1;
    var dispacement = contactDir.scaledBy(overlap/2);
    ball1.displace(dispacement.reversed());
    ball2.displace(dispacement);
  }
  return collide;
};

var ball1 = new Ball(20,20,6,'red');
var ball2 = new Ball(120,120,8,'blue');
var ball3 = new Ball(60,90,10,'orange');
var ball4 = new Ball(90,50,12,'green');


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