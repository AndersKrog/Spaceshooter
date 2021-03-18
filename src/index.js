class Player{
	constructor(game){
		this.gameHeight = game.gameHeight;
		this.gameWidth = game.gameWidth;
		
		this.width = 64;
		this.height = 64;

		this.lasers = new Array();

		this.maxSpeed = 7;
		this.speed = {
			x: 0,
			y: 0		
		}
		this.position = {
			x: game.gameWidth / 2 - this.width /2,
			y: game.gameHeight - this.height - 10
		};
	}
	moveLeft(){
		this.speed.x -=3;
		if (this.speed.x < -this.maxSpeed) this.speed.x = -this.maxSpeed;
	}
	moveRight(){
		this.speed.x +=3;
		if (this.speed.x > this.maxSpeed) this.speed.x = this.maxSpeed;
	}
	moveUp(){
		this.speed.y =-this.maxSpeed;
	}
	moveDown(){
		this.speed.y =this.maxSpeed;
	}
	shoot(){
		this.lasers.push(new Laser(this.position.x + this.width /2,this.position.y -10));
	}
	draw(context) {
		context.drawImage(imgPlane,this.position.x,this.position.y, this.width,this.height);
	}
	update(deltaTime){
		if (!deltaTime) return;
		
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;		
		this.speed.x *= 0.95;
		this.speed.y *= 0.95;
		
		if(this.position.x < 0) this.position.x = 0;
		if(this.position.x + this.width> this.gameWidth) this.position.x = this.gameWidth-this.width;
		if(this.position.y < 0) this.position.y = 0;
		if(this.position.y + this.height > 600) this.position.y = 600 - this.height;
	}
}

class Asteroid{
	constructor(game){
	this.position = {
			x: 0,
			y: 0
		};
	this.hit = false;
	this.hitTime = 15;	// hvor langt tid astroiden er rød
	this.speed;
	this.size;
	this.health;
	this.game = game;
	this.visible = true;
	this.generate();
	}
	generate(){
		// kan optimeres og gøres mere spændende
		this.position.x = Math.floor((Math.random() * this.game.gameWidth) + 1);
		this.position.y = Math.floor((Math.random() * -400));
		this.speed = Math.floor((Math.random() * 4) + 1);
		this.size = this.speed*30;
		this.health = this.size;
		this.hitTime = 0;
		this.visible = true;
	}
	update(deltaTime){
		if (!deltaTime) return;
		this.position.y += this.speed;

		// 
		

		// ikke helt optimalt
		if (this.health <= 0)
			if(this.hitTime >= 0)
				this.destroy();
		
		if (this.hitTime >= 0)
			if(this.hitTime < 15)
				this.hitTime++;
		
				
			
		if(this.position.y + 1 > 600) this.generate();
		
		// collision with player
		let bottomOfAsteroid = this.position.y + this.size;
		let topOfPlayer = this.game.player.position.y;
		let bottomOfPlayer = this.game.player.position.y + this.game.player.height;
		let leftSideOfPlayer = this.game.player.position.x;
		let rightSideOfPlayer = this.game.player.position.x + this.game.player.width;
	
		if(bottomOfAsteroid >= topOfPlayer && this.position.y <= bottomOfPlayer &&
		this.position.x  + this.size >= leftSideOfPlayer && this.position.x <= rightSideOfPlayer){
			this.hit = true;
		}
		else
			this.hit = false;
		
		// collision with laser, ikke optimalt at den ligger her
		game.player.lasers.forEach(laser => laser.collision(this));
	}
	draw(context){
		
		
		// med rotation på
		var rotation = (this.position.y/8) % 360;
		
		context.save();
		context.translate(this.position.x + 0.5*this.size, this.position.y + 0.5*this.size);
		context.rotate((Math.PI/180) * rotation);
		context.translate(-(this.position.x + 0.5*this.size), -(this.position.y + 0.5*this.size));
		
		if (this.hitTime == 15) 
			context.drawImage(imgAsteroid,this.position.x,this.position.y, this.size,this.size);
		else if(this.hitTime > 0)
		{
			context.drawImage(imgAsteroidHit,this.position.x,this.position.y, this.size,this.size);
		}

		context.restore();
	}
	destroy(){
	// her kan ligge en animation eller effekt
	this.visible = false;
	// skal ikke drawes
	this.hitTime = -1;
	this.game.score += 1000;
	this.game.particles.spawn(this.position.x+this.size/2, this.position.y+this.size/2, this.size/20)
	}
}

class AsteroidField{
	constructor(game){
		this.game = game;
		this.AsteroidAmount = game.asteroidAmount;
		this.Asteroids = new Array();
		
		for (var i = 0; i <= this.AsteroidAmount; i++){
			this.Asteroids.push(new Asteroid(game));
		}
	}
	update(deltaTime){
		for (var i = 0; i <= this.AsteroidAmount; i++)
			this.Asteroids[i].update(deltaTime);
	}
	draw(context){
		for (var i = 0; i <= this.AsteroidAmount; i++)
			this.Asteroids[i].draw(game.context);
	}
}

class Laser{
	constructor(positionX, positionY){
		this.position = {x: positionX,y: positionY};
		this.speed = 20;
		this.size= 50;
		this.colorInt;
		this.colorHex = '#f00';
		this.visible = true;
	}
	update(deltaTime){
		if (!deltaTime) return;
		
		if (this.position.y > -20)
			this.position.y -= this.speed;
		else
			this.visible = false;
	}	
	draw(context){
		if (this.visible == true){
		
		//simpel rød laser
		context.fillStyle = this.colorHex;
		context.fillRect(this.position.x,this.position.y,5,this.size);
		
		
		//glow1
/*
		var innerRadius = 5,
		outerRadius = 70,
		// Radius of the entire circle.
		radius = 60;
		
		var gradient = context.createRadialGradient(this.position.x, this.position.y, innerRadius, this.position.x, this.position.y, outerRadius);
		gradient.addColorStop(0, 'white');
		gradient.addColorStop(1, 'blue');

		context.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);

		context.fillStyle = gradient;
		context.fill();
		context.restore();
	*/	
		// glow2
		// Det er tungt at anvende andre composition modes!!
		/*
		var glowSize = 100; 
		context.fillStyle = 'rgba(255, 0, 0, 0.5)';
		context.globalCompositeOperation = "multiply";
		context.fillRect(this.position.x-0.5*5-0.5*glowSize,this.position.y,glowSize,glowSize);
		//context.arc(this.position.x,this.position.y, 10, 0, Math.PI * 2, true);
		//context.stroke();
		context.globalCompositeOperation = "source-over";
		*/
		
		}
	}
	collision(object){
		if (this.visible == true){
		if(object.position.y + object.size >= this.position.y && object.position.y <= this.position.y &&
		object.position.x  + object.size >= this.position.x && object.position.x <= this.position.x){
			if(object.visible == true){
				this.visible = false;
				object.hit = true;
				object.health -= 50;
				object.hitTime = 0;
			}
		}
	}
	}
	destroy(){
	// laseren skal fjernes
	}
}

class Star{
	constructor(gameWidth,gameHeight){
	this.position = {x: 0,y: 0};
	this.speed;
	this.size;                                              
	this.colorInt;
	this.colorHex;
	this.generate();
	}
	generate(){
		this.position.x = Math.floor((Math.random() * 800) + 1);
		this.position.y = Math.floor((Math.random() * -800));
		this.speed = Math.floor((Math.random() * 7) + 1);
		this.size = this.speed;
		
		if (Math.random() < .98)
			this.colorInt = Math.floor((Math.random() * 8000))+1;
		else
			this.colorInt = (Math.floor(Math.random() *16)) *16777216 + 4026532095;
		
		this.colorHex = ('#' + this.colorInt.toString(16).padStart(6, '0'));	
	}
	update(deltaTime){
		if (!deltaTime) return;
		this.position.y += this.speed;
		
		//this.colorInt += Math.floor(Math.sin(this.position.y*20) * 20 +1);
		//this.colorHex = ('#' + this.colorInt.toString(16).padStart(6, '0'));

		if(this.position.y + 1 > 600) this.generate();
	}
	draw(context,context2){
		
		/*
		var my_gradient = context.createLinearGradient(0, 0, 0, 600);

		my_gradient.addColorStop(0, "white");
		my_gradient.addColorStop(0.5, "blue");
		my_gradient.addColorStop(1, "white");
		*/
		
		//context.fillStyle = my_gradient;
		
		context2.fillStyle = this.colorHex;
		context2.fillRect(this.position.x,this.position.y,this.size,this.size);
	}
}
class StarField{
	constructor(game){
		this.starAmount = game.starAmount;
		this.stars = new Array();
		
		for (var i = 0; i <= this.starAmount; i++){
			this.stars.push(new Star(game.gameWidth,game.gameHeight));
		}
	}
	update(deltaTime){
		for (var i = 0; i <= this.starAmount; i++)
			this.stars[i].update(deltaTime);
	}
	draw(context){
		for (var i = 0; i <= this.starAmount; i++)
			this.stars[i].draw(game.context,game.context2);
	}
}

// til inputhandler
var KEY_DOWN = {
	LEFT: false,
	RIGHT: false,
	UP: false,
	DOWN: false,
	PAUSE: false,
	FIRE: false
}

class InputHandler{
	// https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
	constructor(game){
		this.keyDown = KEY_DOWN;
	
		document.addEventListener("keydown", event => {
			if (event.keyCode == 37)
				this.keyDown.LEFT = true;
			if (event.keyCode == 39)
				this.keyDown.RIGHT = true;
			if (event.keyCode == 38)
				this.keyDown.UP = true;
			if (event.keyCode == 40)
				this.keyDown.DOWN = true;
			// der er ikke nogen up til denne keyCode
			if (event.keyCode == 27)
				this.keyDown.PAUSE = true;
			if (event.keyCode == 17)
				this.keyDown.FIRE = true;
		});
			
		document.addEventListener("keyup", event => {
			if (event.keyCode == 37)
				this.keyDown.LEFT = false;
			if (event.keyCode == 39)
				this.keyDown.RIGHT = false;
			if (event.keyCode == 38)
				this.keyDown.UP = false;
			if (event.keyCode == 40)
				this.keyDown.DOWN = false;
		});	
	}
	input(game){
		if (this.keyDown.LEFT == true)
			game.player.moveLeft();
		if (this.keyDown.RIGHT == true)
			game.player.moveRight();
		if (this.keyDown.UP == true)
			game.player.moveUp();
		if (this.keyDown.DOWN == true)
			game.player.moveDown();
		if (this.keyDown.PAUSE == true){
			game.togglePause();
			this.keyDown.PAUSE = false;
		}
		if (this.keyDown.FIRE == true){
			game.player.shoot();
			this.keyDown.FIRE = false;
		}
	}
}

// til gameklassen
const GAMESTATE = {
	PAUSED: 0,
	RUNNING: 1,
	MENU: 2,
	GAMEOVER: 3
	};


// https://gist.github.com/nanu146/aa0e4f8428bc65a8c648cf0ddefc84d4
// Vector og Particle klasser

class Vector{
	constructor(x,y){
		this.x = x;
		this.y = y;
		
	}
	getLength(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	getAngle(){
		return Math.atan2(this.y,this.x)
	}
	setAngle(angle){
		var length = this.getLength();
		this.y = Math.cos(angle)*length;
		this.x = Math.sin(angle)*length;
	}
	setLength(length){
		var angle=this.getAngle();
		this.y = Math.cos(angle)*length;
		this.x = Math.sin(angle)*length;
	}
	addTo(v2){
		this.x = this.x+v2.x;
		this.y = this.y+v2.y;
	}
}

class Particle{
	
	constructor(x,y, speed, angle){

	this.velocity;
	this.lifeTime = 0;
	this.origin;
	this.position;

	this.velocity= new Vector(0,0);
	this.velocity.setLength(speed);
	this.velocity.setAngle(angle);

	this.origin= new Vector(x,y);
	
	this.position= new Vector(x,y);
	}
	
	update(originX,originY){
	this.position.addTo(this.velocity);
	this.lifeTime += 2;

	}
}

class Particles{
	constructor(){
	this.particleArray=[];
	this.numparticles = 350;
	this.size = 1;
	
	for(var i=0; i<this.numparticles;i++){
		this.particleArray.push(new Particle(300,300,(Math.random()*5)+1,Math.random()*Math.PI*2));
		}		
	}
	update(context){
		for(var i = 0; i < this.numparticles;i++){
			this.particleArray[i].update();
			if (this.particleArray[i].lifeTime < 80){
			
			context.beginPath();
			// context.fillStyle = "LightGrey";
			// ideen er at den fader gradvis ud, er ikke indstillet optimalt
			var trans = .6- this.particleArray[i].lifeTime/100;
			context.fillStyle = 'rgba(150, 150, 150, ' + trans +')';
			context.arc(this.particleArray[i].position.x, this.particleArray[i].position.y, this.size/2,0,2*Math.PI,false);
			context.fill();
			}
		}
	}
	spawn(x,y,size){
		for(var i = 0; i < this.numparticles;i++){
			var speed = Math.random()*7+1;
			var angle = Math.random()*Math.PI*2;
			this.particleArray[i].lifeTime = 0;
			this.size = size;
			
			this.particleArray[i].velocity= new Vector(0,0);
			this.particleArray[i].velocity.setLength(speed);
			this.particleArray[i].velocity.setAngle(angle);
			this.particleArray[i].origin= new Vector(x,y);
			this.particleArray[i].position= new Vector(x,y);
		}
	}
}

class Game{
	constructor(gameWidth,gameHeight){
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
	}
	start(){
		this.gamestate = GAMESTATE.RUNNING;
		this.player = new Player(this);
		this.inputHandler = new InputHandler(this);
		
		this.starAmount = 200;
		this.asteroidAmount = 5;
		
		this.score = 0;
		
		this.canvas = document.getElementById("gameScreen");
		this.context = this.canvas.getContext("2d");
		
		this.canvas2 = document.getElementById("backGround");
		this.context2 = this.canvas2.getContext("2d");
		
		this.starField = new StarField(this);
		this.asteroidField = new AsteroidField(this);
		
		// test
		this.particles = new Particles();
		
		
	}
	update(deltaTime){
	// update logic if game is not paused
	
	// burde nok deles op i input til styring og til menu, så man ikke kan bevæge sig i menuen
	this.inputHandler.input(this);
	
	if (this.gamestate == GAMESTATE.RUNNING){

		this.player.lasers.forEach(laser => laser.update(deltaTime));	
		this.starField.update(deltaTime);
		this.asteroidField.update(deltaTime);
		this.player.update(deltaTime);
		}
	}
	draw(context, context2){
	// clearscreen
	
	// effekt
	//context.fillStyle = 'rgba(5, 5, 0, 0.05)';
	
	context2.fillStyle = 'rgba(0, 0, 0, 0.2)';
	context2.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);
	
	// context.fillStyle = 'rgba(0, 0, 0, 0.5)';	// black
	context.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
	
	
	
	// render graphic
	this.starField.draw(context);
	
	// test
	this.particles.update(context2);
	
	this.asteroidField.draw(context);
	this.player.lasers.forEach(laser => laser.draw(context));
	this.player.draw(context);

	
		//score
		context.font = "20px Arial";
		context.fillStyle = "white";
		//context.textAlign = "center";
		context.fillText("Score: " + this.score, this.gameWidth/10*8, this.gameHeight/10*1);
	

	// pauseskærm
	if (game.gamestate == GAMESTATE.PAUSED){		
		context.rect(0,0,game.gameWidth,game.gameHeight);
		context.fillStyle = "rgba(0,0,0,0.5)";
		context.fill();

		context.font = "50px Arial";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText("GAME PAUSED", this.gameWidth/2, this.gameHeight/2);
		}
	}	
	togglePause(){
		this.gamestate = this.gamestate == GAMESTATE.PAUSED? GAMESTATE.RUNNING : GAMESTATE.PAUSED;
	}
}

let imgPlane = document.getElementById('img_plane');
let imgAsteroid = document.getElementById('img_asteroid');
let imgAsteroidHit = document.getElementById('img_asteroid_hit');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let game = new Game(GAME_WIDTH,GAME_HEIGHT);
game.start();

let lastTime = 0;

function gameLoop(timestamp){
let deltaTime = timestamp - lastTime;
lastTime = timestamp;

game.update(deltaTime);
game.draw(game.context,game.context2);

requestAnimationFrame(gameLoop);
}
// start gameloop:
gameLoop();