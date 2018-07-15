var canvas; 
var ctx;
var balls = [];
// Gravitational const
var G = 0.000006;

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
Point.prototype.place = function(point) {
  this.x = point.x;
  this.y = point.y;
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
Vector.prototype.rotated90 = function() {
  return new Vector(-this.y, this.x);
};
Vector.polar = function(radius, angle) {
  return new Vector(radius * Math.cos(angle), radius * Math.sin(angle));
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
  //if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
  //  this.velocity.x = - this.velocity.x;
  //}
  //if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
  //  this.velocity.y = - this.velocity.y;
  //}

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
  //if (this.x < this.radius) {
  //  this.x = this.radius + 1;
  //}
  //if (this.y < this.radius) {
  //  this.y = this.radius + 1;
  //}
  //if (this.x > canvas.width - this.radius) {
  //  this.x = canvas.width - this.radius - 1;
  //}
  //if (this.y > canvas.height - this.radius) {
  //  this.y = canvas.height - this.radius - 1;
  //}
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

var Sun = function(x,y,radius) {
  Ball.call(this,x,y,radius);
};
Sun.prototype = Object.create(Ball.prototype);
Sun.prototype.constructor = Sun;
Sun.prototype.draw = function() {
  var orig = this.radius / 2;
  var grd = ctx.createRadialGradient(this.x, this.y, this.radius*0.8, this.x, this.y, this.radius);
  grd.addColorStop(0, "orange");
  grd.addColorStop(1, "black");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(this.x + this.radius, this.y);
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2, true);
  ctx.fill();
};

var Star = function(x,y,luminosity) {
  Point.call(this,x,y);
  this.luminosity = luminosity;
  this.fillStyle = `rgba(255,255,255,${this.luminosity})`
};
Star.prototype = Object.create(Point.prototype);
Star.prototype.constructor = Star;
Star.prototype.draw = function() {
  ctx.fillStyle = this.fillStyle;
  var rad = this.luminosity < 0.5 ? 2 : 1;
  ctx.fillRect(this.x,this.y,rad,rad);
};
Star.random = function(maxx,maxy) {
  return new Star(
    Math.random() * maxx,
    Math.random() * maxy,
    Math.random()
  );
};

var Starfield = function(width,height,numStars) {
  this.stars = [];
  for (var i=0; i<numStars; ++i) {
    var star = Star.random(width,height);
    this.stars.push(star);
  }
};
Starfield.prototype.draw = function() {
  for (var i=0; i<this.stars.length; ++i) {
    this.stars[i].draw();
  }
}

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

var doGravity = function(ball1,ball2) {
  var between = ball1.vectorTo(ball2);
  var r = between.magnitude();
  var forceMag = G * ball1.mass * ball2.mass / r * r;
  var forceVec = between.unit().scaledBy(forceMag);
  var accn1 = forceVec.scaledBy(1/ball1.mass);
  var accn2 = forceVec.scaledBy(1/ball2.mass);
  // Apply the accelerations
  ball1.velocity = ball1.velocity.add(accn1);
  ball2.velocity = ball2.velocity.add(accn2.reversed());
};

var doGravityForAll = function() {
  for (var i=0; i<balls.length; ++i) {
    for (var j=i+1; j<balls.length; ++j) {
      doGravity(balls[i],balls[j]);
    }
  }
}

var ball1 = new Ball(20,20,3,'red');
var ball2 = new Ball(120,120,4,'blue');
var ball3 = new Ball(60,90,10,'green');
var ball4 = new Sun(200,200,20, 'orange');

var starfield = undefined;

var setup = function() {
  if (canvas === undefined) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
  }
  starfield = new Starfield(canvas.width, canvas.height, 100);
  var centre = new Point(canvas.width / 2, canvas.height / 2);
  for (var i = 0; i<3; ++i) {
    // Reposition at random position in polar coords with orbital velocity
    var r = Math.random() * canvas.width / 4 + 60;
    if (i == 2) {
      r = (canvas.width / 2) - 20;
    }
    var orbit = Vector.polar(r, Math.random() * 2 * Math.PI);
    var pos = centre.displacedBy(orbit);
    balls[i].place(pos);

    // Calculate orbital velocity around ball 4
    var speed =  0.8 * r * Math.sqrt(G * ball4.mass / r);
    balls[i].velocity = orbit.unit().rotated90().scaledBy(speed);
  }

  // Give ball3 three "moons"
  for (j =0; j < 1; ++j) {
    var moon_r = Math.random() * 3 + 20;
    var moon_orbit = Vector.polar(moon_r, 2 * Math.PI * j / 3);
    var moon_pos = ball3.displacedBy(moon_orbit);
    var moon_speed = 1.3 * moon_r * Math.sqrt(G * ball3.mass / moon_r);
    var moonBall = new Ball(moon_pos.x, moon_pos.y, 1, 'yellow');
    moonBall.mass /= 4;
    moonBall.velocity = ball3.velocity.add( moon_orbit.unit().rotated90().reversed().scaledBy(moon_speed) );
  }
  
  var momentum = new Vector(0,0);
  for (var i = 0; i<3; ++i) {
    momentum = momentum.add(balls[i].velocity.scaledBy(balls[i].mass));
  }
  ball4.velocity = momentum.reversed().scaledBy(1/ball4.mass);
  // Set position of ball4 to centre if not already there
  ball4.place(centre);

  draw();
};

var draw = function() {
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width, canvas.height);
  starfield.draw();
  Ball.resetCollisions();
  doGravityForAll();
  for (var i=0; i<balls.length; ++i) {
    balls[i].move();
    balls[i].draw();
  }
  setTimeout(draw, 20);
};

window.onload = setup;