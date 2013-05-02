/*
Copyright (c) 2013 mikeferron.com, ferronsays at github.com (http://github.com/ferronsays)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

//matrices of clock times for each digit
var timeMatrices = new Array();
timeMatrices["1"] = [[[7.5, 37.5], [6, 30]], [[7.5, 37.5], [12, 30]], [[7.5, 37.5], [12, 0]]];
timeMatrices["2"] = [[[3, 15], [9, 30]], [[6, 15], [9, 0]], [[12, 15], [9, 45]]];
timeMatrices["3"] = [[[3, 15], [9, 30]], [[3, 15], [9, 0]], [[3, 15], [9, 0]]];
timeMatrices["4"] = [[[6, 30], [6, 30]], [[12, 15], [12, 30]], [[7.5, 37.5], [12, 0]]];
timeMatrices["5"] = [[[3, 30], [9, 45]], [[12, 15], [9, 30]], [[3, 15], [12, 45]]];
timeMatrices["6"] = [[[3, 30], [9, 45]], [[12, 30], [6, 45]], [[12, 15], [12, 45]]];
timeMatrices["7"] = [[[3, 15], [9, 30]], [[7.5, 37.5], [12, 30]], [[7.5, 37.5], [12, 0]]];
timeMatrices["8"] = [[[3, 30], [9, 30]], [[12, 15], [12, 45]], [[12, 15], [9, 0]]];
timeMatrices["9"] = [[[3, 30], [9, 30]], [[12, 15], [12, 30]], [[3, 15], [9, 0]]];
timeMatrices["0"] = [[[3, 30], [9, 30]], [[12, 30], [12, 30]], [[12, 15], [12, 45]]];


ClockClock = function(num_digits, width, padding, canvas_fg, canvas_bg) {
  this.init(num_digits, width, padding, canvas_fg, canvas_bg);
}

ClockClock.prototype.init = function(num_digits, width, padding, canvas_fg, canvas_bg) {
  this.num_digits = num_digits;

  this.current_time = new Date().getTime();
  this.dt = 0;
  this.last_time = 0;
  this.update_rate_ms = 40;

  window.clockclockupdaterate = this.update_rate_ms;
  window.clockclockpadding = padding;

  this.canvas_fg = document.getElementById(canvas_fg);
  this.canvas_bg = document.getElementById(canvas_bg)

  this.canvas_fg.width  = width;
  this.canvas_fg.height = (width-padding*2) / ((num_digits*2)/3) + padding*2;

  this.canvas_bg.width  = this.canvas_fg.width;
  this.canvas_bg.height = this.canvas_fg.height;

  this.width = this.canvas_fg.width;
  this.height = this.canvas_fg.height;

  this.ctx_fg = this.canvas_fg.getContext('2d');
  this.ctx_bg = this.canvas_bg.getContext('2d');

  this.ctx_bg.clearRect(0, 0, this.width, this.height);
  this.ctx_bg.fillStyle = 'transparent';
  this.ctx_bg.fillRect(0, 0, this.width, this.height);

  this.digits = new Array();

  for(var i = 0; i < num_digits; i++)
  {
    var digit = new Digit(i, (this.width-padding*2)/num_digits, (this.height-padding*2), canvas_fg, canvas_bg);

    this.digits.push(digit);
  }

}

ClockClock.prototype.getCanvasContext = function() {
  return this.ctx;
}

ClockClock.prototype.enable = function() {
  var that = this;

 window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     
    })();

  this.animate(new Date().getTime());
  
  return this;
}

ClockClock.prototype.animate = function(time)
{
    var that = this;
    requestAnimFrame( function(){ that.animate(new Date().getTime());} );
    this.update(time);
}

ClockClock.prototype.disable = function() {
  if (this.intervalId) {
    window.clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
  return this;
}

ClockClock.prototype.update = function(time) {
  this.dt = time - this.current_time;

  this.current_time = time;

  this.ctx_fg.clearRect(0, 0, this.width, this.height);
  this.ctx_fg.fillStyle = 'transparent';
  this.ctx_fg.fillRect(0, 0, this.width, this.height); 

  var currentdate = new Date();
  var hours = currentdate.getHours();
  var minutes = currentdate.getMinutes();

  hours = hours > 12 ? hours - 12 : hours;
  hours = hours < 10 ? "0" + hours : hours;
  hours = hours == 0 ? 12 : hours;

  minutes = minutes < 10 ? "0" + minutes : minutes;

  var new_time = hours+""+minutes+"";
  
  var jumble = false;

  if(new_time != this.last_time)
    jumble = true;

  for (var i=0; i < this.digits.length; ++i) {
    this.digits[i].jumble = jumble;
    this.digits[i].update(new_time.slice(i, i+1), this.dt);
  }

  this.last_time = new_time;
}
/*
*
* DIGIT
*
*/
Digit = function(position, width, height, canvas_fg, canvas_bg)
{
  this.init(position, width, height, canvas_fg, canvas_bg);
}

Digit.prototype.init = function(position, width, height, canvas_fg, canvas_bg)
{
  this.position = position;
  this.width = width;
  this.height = height;

  this.jumble = true;

  this.canvas_fg = document.getElementById(canvas_fg);
  this.canvas_bg = document.getElementById(canvas_bg)

  this.ctx_fg = this.canvas_fg.getContext('2d');
  this.ctx_bg = this.canvas_bg.getContext('2d');

  this.clocks = new Array();

  var current_column = 0;
  var current_row = 0;
  var num_columns = 2;

  this.cell_w = (this.width)/2;
  this.cell_h = (this.height)/3;

  for(var i = 0; i < 6; i++)
  {
    var clock = new Clock(
        position*this.width + current_column*this.cell_w + this.cell_w/2 + window.clockclockpadding,
        current_row*this.cell_h + this.cell_h/2 + window.clockclockpadding, 
        this.cell_w/2,
        current_row,
        current_column,
        canvas_fg, canvas_bg
      );

    this.clocks.push(clock);

    current_column += 1;
    if(current_column == num_columns)
    {
      current_row += 1;
      current_column = 0;
    }
  }
}

Digit.prototype.update = function(val, dt)
{
    for (var i=0; i < this.clocks.length; ++i) {
      this.clocks[i].jumble = this.jumble;
      this.clocks[i].update(val, dt);
    }
}

/*
*
* CLOCK
*
*/
Clock = function(x, y, radius, r, c, canvas_fg, canvas_bg){
  this.init(x, y, radius, r, c, canvas_fg, canvas_bg);
}

Clock.prototype.init = function(x, y, radius, r, c, canvas_fg, canvas_bg)
{
  this.x = x;
  this.y = y;
  this.r = r;
  this.c = c;

  this.jumble = true;

  this.radius = radius;

  this.borderWidth = 1;

  this.radius = this.radius - this.borderWidth;

  this.canvas_fg = document.getElementById(canvas_fg);
  this.canvas_bg = document.getElementById(canvas_bg)

  this.ctx_fg = this.canvas_fg.getContext('2d');
  this.ctx_bg = this.canvas_bg.getContext('2d');

  var m_length = this.radius - 2;
  var h_length = this.radius*3/4 >= m_length ? m_length - 2: this.radius*3/4 ;

  var h_speed = .05;
  var m_speed = h_speed * 2;

  this.m_hand = new Hand(this.x, this.y, m_length, m_speed, "#000", this.ctx_fg);
  this.h_hand = new Hand(this.x, this.y, h_length, h_speed, "#000", this.ctx_fg);

  this.minutes = this.r;
  this.hours = this.c;

  this.draw();
}

Clock.prototype.draw = function()
{
    this.ctx_bg.save();

    this.ctx_bg.shadowColor = '#333';
    this.ctx_bg.shadowBlur = 3;
    this.ctx_bg.shadowOffsetX = 1;
    this.ctx_bg.shadowOffsetY = 1;

    this.ctx_bg.beginPath();
    this.ctx_bg.fillStyle = '#fff';
    this.ctx_bg.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

    this.ctx_bg.fill();
    this.ctx_bg.lineWidth = this.borderWidth;
    this.ctx_bg.strokeStyle = '#000';
    this.ctx_bg.shadowColor = '#333';
    this.ctx_bg.shadowBlur = 2;
    this.ctx_bg.shadowOffsetX = 1;
    this.ctx_bg.shadowOffsetY = 1;
    this.ctx_bg.stroke();

    this.ctx_bg.restore();

    this.ctx_bg.fillStyle = '#000';
    this.ctx_bg.beginPath();
    this.ctx_bg.arc(this.x, this.y, 3.5, 0, Math.PI*2, true); 
    this.ctx_bg.closePath();
    this.ctx_bg.fill();

    //draw ticks
    var ang = 0;
    this.ctx_bg.beginPath();
    this.ctx_bg.strokeStyle = this.color;
    for(var i = 0; i < 60; i++)
    {
      x = this.x + (this.radius - 1)*Math.cos(ang);
      y = this.y + (this.radius - 1)*Math.sin(ang);

      var vec = new Vec2(x- this.x, y - this.y);
      vec.normalize();

      if( i % 5 === 0  && i % 15 !== 0)
      {
        //each 5 minute mark, draw a short line
        this.ctx_bg.lineWidth = 1;
        tickLength = 3;
        draw = true;
      }else if(i % 15 === 0){
        //draw a longer line at 15 minute intervals
        this.ctx_bg.lineWidth = 4;
        tickLength = 10;
        draw = true;
      }else{
        draw = false;
      }

      if(draw)
      {
        this.ctx_bg.moveTo(x, y);
        this.ctx_bg.lineTo(x - vec.x*tickLength, y - vec.y*tickLength);
      }

      ang = ang + (6 * Math.PI/180);
    }

    this.ctx_bg.stroke();
}

Clock.prototype.update = function(val, dt){

    var mx = timeMatrices[""+val+""];

    var minute_angle = Math.atan(Math.sin(-this.x)/Math.sin(this.y));

    this.hours = mx[this.r][this.c][0];
    this.minutes = mx[this.r][this.c][1];

    this.m_hand.timeVal = this.minutes;
    this.m_hand.jumble = this.jumble;
    this.m_hand.target_angle = Math.PI * (2.0 * minuteAngle(this.minutes) - 0.5);
    this.h_hand.timeVal = this.hours;
    this.h_hand.jumble = this.jumble;
    this.h_hand.target_angle = Math.PI * (2.0 * hourAngle(this.hours) - 0.5);

    this.m_hand.update(dt);
    this.h_hand.update(dt);
}
/*
*
* HAND
*
*/
Hand = function(x, y, length, speed, color, ctx){
  this.init(x,y,length, speed, color,ctx);
};

Hand.prototype.init = function( x, y, length, speed, color, ctx){
  this.x = x;
  this.y = y;
  this.length = length;
  this.color = color;
  this.speed = speed;

  this.extra_angle = 0;
  this.angle = (-Math.PI/2) + Math.PI*2;
  this.last_angle = this.angle;
  this.target_angle = this.angle;

  this.timeVal;

  this.jumble = true;

  this.ctx = ctx;

  this.time_passed = 0;
  this.last_jumble_time = 0;

  this.difference;
}

Hand.prototype.update = function(dt){

    var new_vec;

    this.difference = this.target_angle - this.angle;
    //wrap it
    while (this.difference < degreesToRadians(-180))
    {
        this.difference += degreesToRadians(360);
    }
    while (this.difference > degreesToRadians(180))
    {
      this.difference -= degreesToRadians(360);
    }

    //we only want to turn clockwise
    while(this.difference < 0)
    {
      this.difference += degreesToRadians(360);
    }

    //time has changed, lets dance
    if(this.jumble)
    {
      //set the time for the start of the animation
      this.last_jumble_time = this.time_passed;

      if(this.angle == this.target_angle)
      {
        //if we aren't changing our angle, no point in calculating
        this.difference = 0;
      }else{
        //we've got a new angle, lets figure out how far away it is
        var current_vec = new Vec2(this.length * Math.cos(this.angle), 
                                  this.length * Math.sin(this.angle));
        var goal_vec = new Vec2(this.length * Math.cos(this.target_angle), 
                                    this.length * Math.sin(this.target_angle));
      
        current_vec.normalize();
        goal_vec.normalize();
      
        var dot_prod = current_vec.dot(goal_vec);
      }

      //get a random turn count for our animation
      var min = 1;
      var max = 4;
      var turns = Math.floor(Math.random() * (max - min + 1)) + min;

      //set our extra turns
      this.extra_angle = degreesToRadians(turns*360);

      //define where we started
      this.start_angle = this.angle;

      //and where we want to go
      this.end_angle = this.start_angle + this.difference + this.extra_angle;
    }

    //add some time based on the position to make it 'cascade' a bit
    var tm = 4000 + this.x*4;
    var tp = this.time_passed-this.last_jumble_time;
    var percent = tp/tm;

    var e = easeInOutQuad(percent, tp, this.start_angle, this.end_angle, tm);

    if(e >= this.end_angle)
    {
      this.angle = this.target_angle;
    }else{
      this.angle = e;
    }
   
    //calculate our new vector based on the new angle
    new_vec = new Vec2(this.length * Math.cos(this.angle), this.length * Math.sin(this.angle));

    //Finally, lets draw it
    this.ctx.save();
    this.ctx.lineWidth = 7;
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(this.x + new_vec.x, this.y + new_vec.y);
    this.ctx.shadowColor = '#333';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    this.ctx.stroke();

    this.ctx.restore();
    
    //set our last values
    this.last_angle = this.angle;
    this.time_passed += dt;
}

/*
*
* SUPPORT FUNCTIONS
*
*/
function minuteAngle(minute){return minute/60;}

function hourAngle(hour){return hour/12;}

function degreesToRadians(degrees){return degrees*Math.PI/180;}

function Vec2(x_,y_)
{
  this.x = x_;
  this.y = y_;
  
  this.dot = function(vec_) { return (this.x*vec_.x+this.y*vec_.y); }
  this.length = function() { return Math.sqrt(this.dot(this)); }
  this.normalize = function() {var vlen = this.length();this.x = this.x/ vlen;this.y = this.y/ vlen;}
}

function easeInOutQuad(x, t, b, c, d) {
    if(t>d) return c;
    t /= d/2;
    if (t < 1) return (c-b)/2*t*t + b;
    t--;
    return -(c-b)/2 * (t*(t-2) - 1) + b;
}
