var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    ctx = c.getContext( '2d' ),
    
    hw = w / 2,
    hh = h / 2,
    
    opts = {
      strings: [ 'GUSTO KITA' ],
      charSize: 38,
      charSpacing: 42,
      lineHeight: 50,
      
      cx: w / 2,
      cy: h / 2,
      
      sparkleCount: 40,
      
      fireworkPrevPoints: 10,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 200,
      fireworkBaseReachTime: 30,
      fireworkAddedReachTime: 30,
      fireworkCircleBaseSize: 20,
      fireworkCircleAddedSize: 10,
      fireworkCircleBaseTime: 30,
      fireworkCircleAddedTime: 30,
      fireworkCircleFadeBaseTime: 10,
      fireworkCircleFadeAddedTime: 5,
      fireworkBaseShards: 5,
      fireworkAddedShards: 5,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 4,
      fireworkShardAddedVel: 2,
      fireworkShardBaseSize: 3,
      fireworkShardAddedSize: 3,
      gravity: .1,
      upFlow: -.1,
      letterContemplatingWaitTime: 360,
      balloonSpawnTime: 20,
      balloonBaseInflateTime: 10,
      balloonAddedInflateTime: 10,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: .4,
      balloonAddedVel: .4,
      balloonBaseRadian: -( Math.PI / 2 - .5 ),
      balloonAddedRadian: -1,
    },
    calc = {
      totalWidth: opts.charSpacing * Math.max( opts.strings[0].length, opts.strings[0].length )
    },
    
    Tau = Math.PI * 2,
    TauQuarter = Tau / 4,
    
    letters = [],
    sparkles = [],
    hearts = [],
    petals = [],
    floatingHearts = [];

ctx.font = opts.charSize + 'px Georgia';

// ── Romantic color palettes ──────────────────────────────────────────────────
var romanticHues = [340, 350, 0, 15, 320, 300]; // pinks, reds, magentas

// ── Sparkle ──────────────────────────────────────────────────────────────────
function Sparkle(x, y) {
  this.x = x !== undefined ? x : (Math.random() * w - hw);
  this.y = y !== undefined ? y : (Math.random() * h - hh);
  this.size = Math.random() * 2.5 + 1;
  this.life = Math.random() * 0.6 + 0.4;
  this.maxLife = this.life;
  this.opacity = Math.random() * 0.7 + 0.3;
  var hue = romanticHues[Math.floor(Math.random() * romanticHues.length)];
  this.color = 'hsl(' + hue + ', 100%, 75%)';
}
Sparkle.prototype.step = function() { this.life -= 0.018; };
Sparkle.prototype.draw = function() {
  var glow = Math.sin(this.life * Math.PI) * 2 + 2;
  ctx.save();
  ctx.globalAlpha = Math.max(0, this.life * this.opacity);
  ctx.fillStyle = this.color;
  ctx.shadowColor = this.color;
  ctx.shadowBlur = glow * 3;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, 0, Tau);
  ctx.fill();
  ctx.restore();
};

// ── Heart particle ───────────────────────────────────────────────────────────
function Heart(x, y) {
  this.x = x !== undefined ? x : (Math.random() * w - hw);
  this.y = y !== undefined ? y : (Math.random() * h - hh);
  this.vx = (Math.random() - 0.5) * 2;
  this.vy = Math.random() * 1 - 2;
  this.size = Math.random() * 9 + 5;
  this.life = 1;
  this.decay = Math.random() * 0.007 + 0.005;
  this.rotation = (Math.random() - 0.5) * 0.6;
  this.rotationSpeed = (Math.random() - 0.5) * 0.06;
  var hue = [340, 350, 0, 15, 320][Math.floor(Math.random() * 5)];
  this.color = 'hsl(' + hue + ', 100%, 60%)';
}
Heart.prototype.step = function() {
  this.x += this.vx;
  this.y += this.vy;
  this.vy += 0.04;
  this.rotation += this.rotationSpeed;
  this.life -= this.decay;
  this.vx *= 0.99;
};
Heart.prototype.draw = function() {
  ctx.save();
  ctx.globalAlpha = this.life;
  ctx.translate(this.x, this.y);
  ctx.rotate(this.rotation);
  ctx.fillStyle = this.color;
  ctx.shadowColor = this.color;
  ctx.shadowBlur = 8;
  drawHeart(ctx, this.size);
  ctx.restore();
};

// ── Rose Petal ───────────────────────────────────────────────────────────────
function Petal(x, y) {
  this.x = x !== undefined ? x : (Math.random() * w - hw);
  this.y = y !== undefined ? y : -hh - 10;
  this.vx = (Math.random() - 0.5) * 1.5;
  this.vy = Math.random() * 1.5 + 0.5;
  this.size = Math.random() * 7 + 4;
  this.life = 1;
  this.decay = Math.random() * 0.006 + 0.004;
  this.rotation = Math.random() * Tau;
  this.rotationSpeed = (Math.random() - 0.5) * 0.08;
  this.wobble = 0;
  this.wobbleSpeed = Math.random() * 0.05 + 0.02;
  var pinkHues = [340, 350, 355, 5, 320, 330];
  var hue = pinkHues[Math.floor(Math.random() * pinkHues.length)];
  var lightness = Math.floor(Math.random() * 20 + 60);
  this.color = 'hsl(' + hue + ', 90%, ' + lightness + '%)';
}
Petal.prototype.step = function() {
  this.wobble += this.wobbleSpeed;
  this.x += this.vx + Math.sin(this.wobble) * 0.5;
  this.y += this.vy;
  this.rotation += this.rotationSpeed;
  this.life -= this.decay;
};
Petal.prototype.draw = function() {
  ctx.save();
  ctx.globalAlpha = this.life * 0.85;
  ctx.translate(this.x, this.y);
  ctx.rotate(this.rotation);
  ctx.fillStyle = this.color;
  // Oval petal shape
  ctx.beginPath();
  ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Tau);
  ctx.fill();
  ctx.restore();
};

// ── Floating heart (rises upward slowly) ────────────────────────────────────
function FloatingHeart(x, y) {
  this.x = x !== undefined ? x : (Math.random() * w - hw);
  this.y = y !== undefined ? y : hh;
  this.vx = (Math.random() - 0.5) * 0.8;
  this.vy = -(Math.random() * 1 + 0.5);
  this.size = Math.random() * 12 + 6;
  this.life = 1;
  this.decay = Math.random() * 0.005 + 0.003;
  this.rotation = (Math.random() - 0.5) * 0.4;
  this.pulse = Math.random() * Tau;
  this.pulseSpeed = Math.random() * 0.05 + 0.02;
  var hue = [340, 350, 0, 320][Math.floor(Math.random() * 4)];
  this.color = 'hsl(' + hue + ', 100%, 65%)';
}
FloatingHeart.prototype.step = function() {
  this.x += this.vx;
  this.y += this.vy;
  this.pulse += this.pulseSpeed;
  this.life -= this.decay;
};
FloatingHeart.prototype.draw = function() {
  var scale = 1 + Math.sin(this.pulse) * 0.06;
  ctx.save();
  ctx.globalAlpha = this.life * 0.8;
  ctx.translate(this.x, this.y);
  ctx.rotate(this.rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = this.color;
  ctx.shadowColor = this.color;
  ctx.shadowBlur = 12;
  drawHeart(ctx, this.size);
  ctx.restore();
};

// ── Heart shape helper ───────────────────────────────────────────────────────
function drawHeart(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, -size / 4);
  ctx.bezierCurveTo(-size / 2, -size * 0.9, -size, -size * 0.1, 0, size * 0.6);
  ctx.bezierCurveTo( size, -size * 0.1,  size / 2, -size * 0.9, 0, -size / 4);
  ctx.fill();
}

// ── Letter ───────────────────────────────────────────────────────────────────
function Letter( char, x, y ){
  this.char = char;
  this.x = x;
  this.y = y;
  
  this.dx = -ctx.measureText( char ).width / 2;
  this.dy = +opts.charSize / 2;
  
  this.fireworkDy = this.y - hh;
  
  var hue = romanticHues[((Math.floor(x / calc.totalWidth * romanticHues.length) % romanticHues.length) + romanticHues.length) % romanticHues.length];
  
  this.color = 'hsl(' + hue + ',90%,60%)';
  this.lightAlphaColor = 'hsla(' + hue + ',90%,light%,alp)';
  this.lightColor = 'hsl(' + hue + ',90%,light%)';
  this.alphaColor = 'hsla(' + hue + ',90%,60%,alp)';
  
  this.reset();
}
Letter.prototype.reset = function(){
  this.phase = 'firework';
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = opts.fireworkSpawnTime * Math.random() |0;
  this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() |0;
  this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [ [ 0, hh, 0 ] ];
};
Letter.prototype.step = function(){
  
  if( this.phase === 'firework' ){
    
    if( !this.spawned ){
      ++this.tick;
      if( this.tick >= this.spawningTime ){
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;
      
      var linearProportion = this.tick / this.reachTime,
          armonicProportion = Math.sin( linearProportion * TauQuarter ),
          x = linearProportion * this.x,
          y = hh + armonicProportion * this.fireworkDy;
      
      if( this.prevPoints.length > opts.fireworkPrevPoints )
        this.prevPoints.shift();
      
      this.prevPoints.push( [ x, y, linearProportion * this.lineWidth ] );
      
      var lineWidthProportion = 1 / ( this.prevPoints.length - 1 );
      
      for( var i = 1; i < this.prevPoints.length; ++i ){
        var point = this.prevPoints[ i ],
            point2 = this.prevPoints[ i - 1 ];
        ctx.strokeStyle = this.alphaColor.replace( 'alp', i / this.prevPoints.length );
        ctx.lineWidth = point[ 2 ] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo( point[ 0 ], point[ 1 ] );
        ctx.lineTo( point2[ 0 ], point2[ 1 ] );
        ctx.stroke();
      }
      
      if( this.tick >= this.reachTime ){
        this.phase = 'contemplate';
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() |0;
        this.circleCreating = true;
        this.circleFading = false;
        this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() |0;
        this.tick = 0;
        this.tick2 = 0;
        this.shards = [];
        var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() |0,
            angle = Tau / shardCount,
            cos = Math.cos( angle ),
            sin = Math.sin( angle ),
            x = 1, y = 0;
        for( var i = 0; i < shardCount; ++i ){
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;
          this.shards.push( new Shard( this.x, this.y, x, y, this.alphaColor ) );
        }
      }
    }
  } else if( this.phase === 'contemplate' ){
    
    ++this.tick;
    
    if( this.circleCreating ){
      ++this.tick2;
      var proportion = this.tick2 / this.circleCompleteTime,
          armonic = -Math.cos( proportion * Math.PI ) / 2 + .5;
      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace( 'light', 50 + 50 * proportion ).replace( 'alp', proportion );
      ctx.beginPath();
      ctx.arc( this.x, this.y, armonic * this.circleFinalSize, 0, Tau );
      ctx.fill();
      if( this.tick2 > this.circleCompleteTime ){
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if( this.circleFading ){
      ctx.fillStyle = this.lightColor.replace( 'light', 75 );
      ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
      ++this.tick2;
      var proportion = this.tick2 / this.circleFadeTime,
          armonic = -Math.cos( proportion * Math.PI ) / 2 + .5;
      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace( 'light', 100 ).replace( 'alp', 1 - armonic );
      ctx.arc( this.x, this.y, this.circleFinalSize, 0, Tau );
      ctx.fill();
      if( this.tick2 >= this.circleFadeTime )
        this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace( 'light', 75 );
      ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
    }
    
    for( var i = 0; i < this.shards.length; ++i ){
      this.shards[ i ].step();
      if( !this.shards[ i ].alive ){
        this.shards.splice( i, 1 );
        --i;
      }
    }
    
    if( this.tick > opts.letterContemplatingWaitTime ){
      this.phase = 'balloon';
      this.tick = 0;
      this.spawning = true;
      this.spawnTime = opts.balloonSpawnTime * Math.random() |0;
      this.inflating = false;
      this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() |0;
      this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() |0;
      var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
          vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
      this.vx = Math.cos( rad ) * vel;
      this.vy = Math.sin( rad ) * vel;
    }
  } else if( this.phase === 'balloon' ){
    
    ctx.strokeStyle = this.lightColor.replace( 'light', 80 );
    
    if( this.spawning ){
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace( 'light', 70 );
      ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
      if( this.tick >= this.spawnTime ){
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if( this.inflating ){
      ++this.tick;
      var proportion = this.tick / this.inflateTime,
          x = this.cx = this.x,
          y = this.cy = this.y - this.size * proportion;
      ctx.fillStyle = this.alphaColor.replace( 'alp', proportion );
      ctx.beginPath();
      generateHeartBalloonPath( x, y, this.size * proportion );
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo( x, y );
      ctx.lineTo( x, this.y );
      ctx.stroke();
      ctx.fillStyle = this.lightColor.replace( 'light', 70 );
      ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
      if( this.tick >= this.inflateTime ){
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateHeartBalloonPath( this.cx, this.cy, this.size );
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo( this.cx, this.cy );
      ctx.lineTo( this.cx, this.cy + this.size );
      ctx.stroke();
      ctx.fillStyle = this.lightColor.replace( 'light', 70 );
      ctx.fillText( this.char, this.cx + this.dx, this.cy + this.dy + this.size );
      if( this.cy + this.size < -hh || this.cx < -hw || this.cy > hw )
        this.phase = 'done';
    }
  }
};

// ── Shard ─────────────────────────────────────────────────────────────────────
function Shard( x, y, vx, vy, color ){
  var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
  this.vx = vx * vel;
  this.vy = vy * vel;
  this.x = x;
  this.y = y;
  this.prevPoints = [ [ x, y ] ];
  this.color = color;
  this.alive = true;
  this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function(){
  this.x += this.vx;
  this.y += this.vy += opts.gravity;
  if( this.prevPoints.length > opts.fireworkShardPrevPoints )
    this.prevPoints.shift();
  this.prevPoints.push( [ this.x, this.y ] );
  var lineWidthProportion = this.size / this.prevPoints.length;
  for( var k = 0; k < this.prevPoints.length - 1; ++k ){
    var point = this.prevPoints[ k ],
        point2 = this.prevPoints[ k + 1 ];
    ctx.strokeStyle = this.color.replace( 'alp', k / this.prevPoints.length );
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo( point[ 0 ], point[ 1 ] );
    ctx.lineTo( point2[ 0 ], point2[ 1 ] );
    ctx.stroke();
  }
  if( this.prevPoints[ 0 ][ 1 ] > hh )
    this.alive = false;
};

// ── Heart balloon path (replaces standard balloon) ───────────────────────────
function generateHeartBalloonPath( x, y, size ){
  ctx.moveTo(x, y - size / 4);
  ctx.bezierCurveTo(x - size / 2, y - size * 0.9, x - size, y - size * 0.1, x, y + size * 0.6);
  ctx.bezierCurveTo(x + size, y - size * 0.1, x + size / 2, y - size * 0.9, x, y - size / 4);
}

// ── Animation loop ────────────────────────────────────────────────────────────
function anim(){
  window.requestAnimationFrame( anim );
  
  // Dark romantic overlay (semi-transparent so trails fade)
  ctx.fillStyle = 'rgba(20, 0, 12, 0.22)';
  ctx.fillRect( 0, 0, w, h );

  // Ambient glow center
  var grd = ctx.createRadialGradient(hw, hh, 0, hw, hh, Math.min(w, h) * 0.5);
  grd.addColorStop(0, 'rgba(180, 0, 60, 0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Spawn ambient particles
  if (Math.random() < 0.55) sparkles.push(new Sparkle());
  if (Math.random() < 0.28) hearts.push(new Heart());
  if (Math.random() < 0.18) petals.push(new Petal(Math.random() * w - hw, -hh - 10));
  if (Math.random() < 0.12) floatingHearts.push(new FloatingHeart(Math.random() * w - hw, hh + 20));

  // Step & draw sparkles
  for (var i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].step(); sparkles[i].draw();
    if (sparkles[i].life <= 0) sparkles.splice(i, 1);
  }
  // Step & draw floating hearts
  for (var i = floatingHearts.length - 1; i >= 0; i--) {
    floatingHearts[i].step(); floatingHearts[i].draw();
    if (floatingHearts[i].life <= 0) floatingHearts.splice(i, 1);
  }
  // Step & draw petals
  for (var i = petals.length - 1; i >= 0; i--) {
    petals[i].step(); petals[i].draw();
    if (petals[i].life <= 0) petals.splice(i, 1);
  }
  // Step & draw hearts
  for (var i = hearts.length - 1; i >= 0; i--) {
    hearts[i].step(); hearts[i].draw();
    if (hearts[i].life <= 0) hearts.splice(i, 1);
  }

  ctx.translate( hw, hh );
  
  var done = true;
  for( var l = 0; l < letters.length; ++l ){
    letters[ l ].step();
    if( letters[ l ].phase !== 'done' ) done = false;
  }
  
  ctx.translate( -hw, -hh );
  
  if( done ){
    for( var l = 0; l < letters.length; ++l )
      letters[ l ].reset();
    
    // Burst of hearts & petals on reset
    for (var i = 0; i < 60; i++) {
      var x = (Math.random() - 0.5) * w;
      var y = (Math.random() < 0.5 ? -hh : hh * (Math.random() < 0.5 ? 0 : 1));
      hearts.push(new Heart(x, y));
    }
    for (var i = 0; i < 50; i++) {
      petals.push(new Petal(Math.random() * w - hw, -hh - Math.random() * 50));
    }
    for (var i = 0; i < 30; i++) {
      floatingHearts.push(new FloatingHeart((Math.random() - 0.5) * w * 0.8, hh));
    }
  }
}

// ── Build letters ─────────────────────────────────────────────────────────────
for( var i = 0; i < opts.strings.length; ++i ){
  for( var j = 0; j < opts.strings[ i ].length; ++j ){
    letters.push( new Letter( opts.strings[ i ][ j ], 
                            j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[ i ].length * opts.charSpacing / 2,
                            i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2 ) );
  }
}

anim();

window.addEventListener( 'resize', function(){
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
  ctx.font = opts.charSize + 'px Georgia';
});
