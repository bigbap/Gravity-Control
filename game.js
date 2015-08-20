var Game = function(cid, w, h, callback){
	var that = this;
	var txtColor = "#333"; //default text color
	var fps = 30;
	var resourcesFile = 'resources.json';

	// add event listeners, this will store key pressed on key down in an array and remove on keyup
	document.addEventListener('keydown', function(e){
		var key = e.keyCode;
		var index = that.keysPressed.indexOf(key);
		if(index === -1){
			that.keysPressed.push(key);
		}
	});
	document.addEventListener('keyup', function(e){
		var key = e.keyCode;
		var index = that.keysPressed.indexOf(key);
		if(index > -1){
			that.keysPressed.splice(index, 1);
		}
	});
	
	/***********************/
	/* member variables
	/***********************/
	var ca = this.ca = document.getElementById(cid);
	var cx = this.cx = ca.getContext('2d');
	this.ts = 20; //tile size in pixels
	this.ca.setAttribute('width', w*this.ts);
	this.ca.setAttribute('height', h*this.ts);
	this.tileW = w; //tile width
	this.tileH = h; //tile height
	this.w = parseInt(this.ca.getAttribute('width')); //pixel width
	this.h = parseInt(this.ca.getAttribute('height')); //pixel height
	this.topStart = 2; //start of game window

	this.objQ = []; //object queue
	this.iLoaded = false; //images loaded
	this.tick = new Date().getTime(); //draw tick
	this.utick = new Date().getTime(); //update tick
	this.currLevel = 0;
	this.levelObj; //current level object
	this.keysPressed = []; //array to store keys currently being pressed
	this.timePlayed = 0;
	
	/***********************/
	/* member methods
	/***********************/
	this.init = function(){ // initialize
		this.loadResourses();

		//we must wait for images to be loaded before loading start screen
		if(this.iLoaded == false){
			var wait = function(){
				if(this.iLoaded == false){
					setTimeout(wait, 300);
				}else{
					this.loadLevel('start');

					callback.apply(this);
				}
			};
			setTimeout(wait, 300);
		}
	};

	this.update = function(){
		/****************************************/
		/* update happens on each loop iteration.
		/* first run current level update method.
		/* loop through objects in object queue
		/* and run each object's update method.
		/****************************************/

		n = new Date().getTime();
		var i = n - this.utick; //i is interval since last update, passed to all update methods

		if(this.levelObj !== undefined){
			this.levelObj.update(i);
		}
		
		for(o in this.objQ){
			if(this.objQ[o] !== undefined){
				this.objQ[o].update(i);
			}
		}

		this.utick = n; //reset update tick
	};
	this.draw = function(){
		/****************************************/
		/* draw happens at fps rate.
		/* first run current level draw method.
		/* loop through objects in object queue
		/* and run each object's draw method.
		/****************************************/

		this.cx.clearRect(0, 0, this.w, this.h); //clear screen

		if(this.levelObj !== undefined){
			this.levelObj.draw();
		}

		for(o in this.objQ){
			if(this.objQ[o] !== undefined){
				this.objQ[o].draw();
			}
		}
	};

	this.run = function(){
		//run update on every loop iteration
		that.update();

		//run draw at fps rate
		var thisTick = new Date().getTime();
		var i = thisTick - that.tick;
		if(i >= 1000 / fps){
			that.draw();
			that.tick = thisTick;
		}
	};

	this.loadLevel = function(l){ //load a level or load start or over screen
		this.objQ = [];
		if(l === 'start'){
			this.levelObj = new startScreen();
		}else if(l === 'over'){
			this.levelObj = new overScreen();
		}else{
			this.objQ = [];
			this.currLevel = l;

			this.levelObj = new Level(this, 'tile');
		}
	};
	
	this.loadResourses = function(){
		/****************************************/
		/* load resources from file stored in 
		/* resourcesFile variable.
		/* file currently only stores sprite data
		/****************************************/

		var client = new XMLHttpRequest();
		client.open('GET', resourcesFile);
		client.onreadystatechange = function() {
			if(client.readyState == 4){
				var jData = JSON.parse(client.responseText);
				
				var spriteData = jData.sprites;
				var spriteSheet = jData.spriteSheet;

				sprites.load(spriteSheet, spriteData, function(){
					that.iLoaded = true;
				});
			}
		}
		client.send();
	};

	//sprites object, loads sprite data and handles draw for sprites
	var sprites = new function(){
		this.data = {}; //date stores x and y coord on spritesheet, w and h of sprite, and number of frames

		this.load = function(rImage, data, callback){
			this.data = data;
			this.image = new Image();
			this.image.onload = callback;
			this.image.src = rImage;
		};

		this.draw = function(sprite, x, y, frame){
			var s = this.data[sprite]; //this sprite
			frame = !frame ? 0 : frame; //default frame is 0
			cx.drawImage(this.image, s.sx + frame * s.w, s.sy, s.w, s.h, x, y, s.w*s.dimM, s.h*s.dimM);
		};
	};

	/***********************/
	/* private classes
	/***********************/
	var startScreen = function(){
		// start screen.
		// on update check if enter key is pressed
		// load level 1 if enter is pressed

		this.update = function(){
			if(that.keysPressed.indexOf(13) > -1){
				that.loadLevel(1);
			}
		};

		this.draw = function(){
			if(that.cx !== undefined){
				that.cx.fillStyle=txtColor;
				that.cx.font = "48px verdana";
				that.cx.textAlign = "center";
				that.cx.fillText("Gravity Control", that.w/2, (that.h/2) - 75);
				that.cx.font = "14px verdana";
				that.cx.fillText("The world as we know it has ended, even Gravity is out of wack.", that.w/2, that.h/2);
				that.cx.fillText("Your mission is to defeat all the blobs on your way to the big red button.", that.w/2, that.h/2 + 30);
				that.cx.fillText("The big red button is the key to righting the Gravity problem.", that.w/2, that.h/2 + 60);
				that.cx.font = "10px verdana";
				that.cx.fillText("{left and right arrow} move from side to side, {space} fire, {up arrow} use jetpack.  You must be on a tile to use the jetpack.", this.w/2, this.h/2 + 90);
				that.cx.font = "14px verdana";
				that.cx.fillText("Press ENTER to start.", that.w/2, that.h/2 + 140);
			}
		};
	};

	var overScreen = function(){
		// game over screen.
		// display scores.
		// on update check if enter or esc key is pressed
		// load level 1 if enter is pressed
		// load start screen if esc is pressed

		var totalTime = that.timePlayed;
		that.timePlayed = 0;

		this.update = function(){
			if(that.keysPressed.indexOf(27) > -1){
				that.loadLevel('start');
			}else if(that.keysPressed.indexOf(13) > -1){
				that.loadLevel(1);
			}
		};

		this.draw = function(){
			if(that.cx !== undefined){
				that.cx.fillStyle=txtColor;
				that.cx.font = "48px verdana";
				that.cx.fillText("Game Over", that.w/2, that.h/2 - 100);
				that.cx.font = "16px verdana";
				that.cx.fillText("You completed " + (that.currLevel - 1) + " levels in " + (totalTime/1000).toFixed(2) + " seconds.", that.w/2, that.h/2 -50);
				that.cx.font = "12px verdana";
				that.cx.fillText("Press ESC to go back to start screen.", that.w/2, that.h/2 + 20);
				that.cx.fillText("Press ENTER to go restart at level 1.", that.w/2, that.h/2 + 50);
			}
		};
	};

	var Hero = function(game, x, y, sprite){
		/***********************/
		/* hero class
		/***********************/

		//start tile position
		this.x = x;
		this.y = y;

		this.frame = 1; // start frame
		this.s = sprite; // hero sprite
		
		//hero movement speed
		this.dx = 0;
		this.dy = 0;

		// tick used to control movement speed
		// hero will move dx or dy distance every
		// 50 ms
		this.xTick = 0;
		this.yTick = 0;

		// jetpack
		this.jetpack = false;
		this.jetpackTimer = 5000;

		
		this.fireTick = 0; // tick to control fire frequency
		var that = this;

		var chkCol = function(t, h, e){
			// check collision with map
			// or with enemy
			if(t == "map"){
				var yBelow = Math.ceil(that.y)-1;
				var xBelow1 = Math.floor(that.x);
				var xBelow2 = Math.ceil(that.x);

				// check collision with tiles below
				// and on either side of hero
				var tileBelow1 = game.levelObj.getTile(xBelow1, yBelow);
				var tileBelow2 = game.levelObj.getTile(xBelow2, yBelow);

				if(tileBelow1 == 1 || tileBelow2 == 1){
					return true;
				}

				return false;
			}else{
				// check collision with object h and object e
				var abs = Math.abs;
				return (abs(h.x - e.x) * 2 < (1)) && (abs(h.y - e.y) * 2 < (1));
			}
		};

		this.update = function(i){
			// add interval to all ticks
			this.xTick += i;
			this.yTick += i;
			this.fireTick += i;

			// check if any relevant keys are being pressed
			var left = game.keysPressed.indexOf(37);
			var right = game.keysPressed.indexOf(39);
			var jetpack = game.keysPressed.indexOf(40);
			var fire = game.keysPressed.indexOf(32);

			// if down arrow is pressed, set jetpack to true and
			// update jetpackTimer with interval
			// if allowed jetpack time is exceeded, set jetpack to false
			this.jetpack = jetpack > -1 ? true : false;
			this.jetpackTimer = this.jetpack ? this.jetpackTimer - i : this.jetpackTimer;
			if(this.jetpackTimer <= 0){
				this.jetpack = false;
				this.jetpackTimer = 0;
			}

			// check for right and left arrow key and set dx accordingly
			this.dx = left > -1 ? -0.25 : right > -1 ? 0.25 : 0;

			// check for space key and run fire method if pressed
			if(fire > -1)this.fire();

			// if jetpack is true, set dy accordingly
			if(this.jetpack){
				this.dy = 0.25;
			}else{
				// if jetpack is false, check for
				// collision with tile and set dy to
				// 0 if true and apply fall to dy if
				// false.
				if(this.y % 1 == 0){
					if(chkCol('map')){
						this.dy = 0;
						this.yTick = 0;
					}else{
						this.dy = -0.25;
					}
				}
			}

			// apply dx and dy to x and y every 50 ms
			// then reset x and y Ticks
			if(this.xTick >= 50){
				this.x += this.dx;
				this.xTick = 0;
			}
			if(this.yTick >= 50){
				this.y += this.dy;
				this.yTick = 0;
			}

			// change directional frame accordingly
			var f = this.frame;
			if(this.dx > 0){
				f = 1;
			}else if(this.dx < 0){
				f = 0;
			}
			// add 2 to frame if jetpack is true
			if(this.jetpack && (f == 1 || f == 0)){
				f = f + 2;
			}else if(!this.jetpack && (f > 1)){
				f = f - 2;
			}
			this.frame = f;

			// check if hero has gone off screen and end game if so
			if(this.x*game.ts > game.w || this.x*game.ts < 0 || this.y*game.ts > game.h || this.y*game.ts < game.topStart){
				game.loadLevel('over');
			}

			// check for collision with enemy
			// this also checks if there are no enemies
			// left and loads the next level if that's
			// the case
			var levelOver = true;
			for(var i in game.objQ){
				if(game.objQ[i].constructor.name == 'Enemy'){
					levelOver = false;
					e = game.objQ[i];
					if(chkCol('enemy', this, e)){
						game.loadLevel('over');
						break;
					}
				}
			}
			if(levelOver)loadLevel(game.currLevel + 1); // if level is complete load next level
		};

		this.draw = function(){
			// draws the jetpack timer and the hero sprite

			game.cx.fillStyle=txtColor;
			game.cx.font = "12px verdana";
			game.cx.fillText("Jetpack time remaining: " + (this.jetpackTimer/1000).toFixed(2) + " seconds", game.w-140, 25);

			sprites.draw(this.s,this.x*game.ts,this.y*game.ts,this.frame);
		};

		this.fire = function(){
			// fires a bullet every 250 ms if the fire
			// key is pressed

			if(this.fireTick > 250){
				// create a new bullet object at the hero's
				// position and add it to the object queue

				var dir = [1,3].indexOf(this.frame) == -1 ? -1 : 1; // direction
				var bullet = new Bullet(game, this.x, this.y, dir, 'bullet');

				game.objQ.push(bullet);
				this.fireTick = 0;
			}
		};
	};

	var Bullet = function(game, x, y, dir, sprite){
		this.s = sprite;
		this.x = x;
		this.y = y;
		this.dir = dir; // direction
		this.animTick = 0; // move bullet every 25 ms

		var chkCol = function(b, e){
			// check collision between b and e objects
			// b = bullet, e = enemy
			var abs = Math.abs;
			return (abs(b.x - e.x) * 2 < (1)) && (abs(b.y - e.y) * 2 < (1));
		};

		this.destroy = function(){
			// if bullet exists in object queue
			// remove it

			var index = game.objQ.indexOf(this);
			if(index > -1){
				game.objQ.splice(index, 1);
			}
		};

		this.update = function(i){
			// update bullet x position every animTick
			this.animTick += i;
			if(this.animTick >= 25){
				this.x += dir > 0 ? 0.25 : -0.25;
				this.animTick = 0;
			}

			// loop through enemy objects and check for
			// collision.  If collided, destroy bullet
			// and enemy.
			for(var i in game.objQ){
				if(game.objQ[i].constructor.name == 'Enemy'){
					e = game.objQ[i];
					if(chkCol(this, e)){
						this.destroy();
						e.destroy();
						break;
					}
				}
			}

			// destroy bullet if gone off screen
			if(this.x > game.tileW || this.x < 0 || this.y > game.tileH || this.y < 0){
				this.destroy();
			}
		};

		this.draw = function(){
			// draw bullet
			sprites.draw(this.s,this.x*game.ts,this.y*game.ts);
		};

		return this;
	};
	
	function Enemy(game, group, sprite){ // x, y, sx, sy, 
		this.s = sprite;
		this.frame = 0; // start frame

		// movement tick
		this.xtick = 0;
		this.ytick = 0;

		// variables to restrict movement to given platform
		// xs = xStart, xe = xEnd. They correspond to tile
		// start and tile end positions
		this.xs = typeof(group[0]) !== 'number' ? group[0][0] : group[0];
		this.xe = typeof(group[0]) !== 'number' ? group[0][1]-1 : group[0]-1;
		this.ys = typeof(group[1]) !== 'number' ? group[1][0] : group[1];
		this.ye = typeof(group[1]) !== 'number' ? group[1][1]-1 : group[1]-1;

		// set start position and speed
		this.x = Math.floor(Math.random() * (this.xe - this.xs)) + this.xs;
		this.y = Math.floor(Math.random() * (this.ye - this.ys)) + (this.ys+2);
		this.dx = ((Math.random() * 100) + 25) * (Math.ceil((Math.random() * 2)) === 1 ? 1 : -1);
		this.dy = 0;
		this.dir = this.dx < 0 ? 0 : 2; // direction used to calculate correct frame to display

		this.animTick = 0; // change sprite frame every 250 ms
		var that = this;
		
		this.update = function(i){
			// update tics with interval
			this.animTick += i;
			this.xtick += i;
			this.ytick += i;

			// do animation every 250 ms
			if(this.animTick >= 250){
				this.frame++;
				if(this.frame > 1)this.frame = 0;
				this.animTick = 0;
			}

			// enemy movement is a bit different from every other moverment
			// because enemy movement must be confined to a platform, it's
			// easier to move in 0.25 increments, so the speed calculation
			// is the time in ms, to update the enemy position.
			if(this.xtick >= Math.abs(this.dx)){
				this.x += this.dx < 0 ? -0.25 : this.dx == 0 ? 0 : 0.25;
				this.xtick = 0;

				if(this.x >= this.xe || this.x <= this.xs){
					// flip direction and set x to the edge of platform
					this.x = this.x >= this.xe ? this.xe : this.xs;
					this.dx *= -1;
					this.dir = this.dx < 0 ? 0 : 2;

				}
			}
			if(this.ytick >= Math.abs(this.dy)){
				this.y += this.dy < 0 ? -0.25 : this.dy == 0 ? 0 : 0.25;
				this.ytick = 0;

				if(this.y == this.ye || this.y == this.ys){
					this.dy *= -1;
				}
			}
		};
		
		this.draw = function(){
		   	sprites.draw(this.s,this.x*game.ts,this.y*game.ts,this.frame+this.dir);
		};

		this.destroy = function(){
			// check if this enemy is in the object queue and remove it
			var index = game.objQ.indexOf(this);
			if(index > -1){
				game.objQ.splice(index, 1);
			}
		};
		
		return this;
	};


	var Level = function(game, s){
		/***********************/
		/* level class
		/***********************/

		// map array. This is a 2d array of tiles generated from the platform 
		// groups created in this.init(). Format = [0,0,0,0,0,1,1,1,1...]
		var map = [];
		var tileGroup = Math.floor(Math.random() * 2); // determines the tiles to use

		var sprite = s; // tile sprite for platforms

		this.init = function(){
			// initialize level
			var m = []; // map array to hold tile groups
			var enemies = []; // array to hold enemies

			/***********************************/
			/* generate the map dynamically
			/***********************************/
			var platforms = Math.ceil(Math.random() * 2) + 4; // first calculate number of platforms
			var yVals = []; // array to hold the y value of each platform
			var lastVal = -1; // last platform's y value, this is to prevent platforms from being too close to each other
			
			// loop through platforms and generate [x,y] value group
			for(var n = 0; n <= platforms; n++){
				// y value is calculated at random within a range
				// of 4 and minimum 4 tiles away from last y value
				var tY = Math.floor(Math.random() * 4) + lastVal + 4;

				if(tY < 35){ // don't create any platforms past tile 35, this is to sllow space for start platform
					// generate x start and x end values. x start is contained within
					// the first half of the map and x end is contained within the second
					// half of the map. There is provision for blank space on either side
					// of the platform to prevent the platform from spanning the width of the map
					var tX1 = Math.floor(Math.random() * (game.tileW / 2)) + 1;
					var tX2 = Math.floor(Math.random() * ((game.tileW / 2) - 10)) + (game.tileW / 2) + 10;

					var xVal = [tX1, tX2]; // set the xVal group
					var thisP = [xVal, tY]; // set the tile group
					m.push(thisP); // push this group to the map array

					// generate random number of enemies for this platform
					// this is based off of the size of the platform
					var e = Math.floor((tX2-tX1)/3);
					for(var i = 0; i <= e; i++){
						// add enemy to enemy array
						enemies.push([n,"zombie"]); // format is [platform, sprite]
					}

					lastVal = tY; // reset last y value
				}
			}
			m.push([[0,1],37]); // add hero start platform

			// convert the m array storing platform groups into the
			// map array which stores tile values of 0 or 1.
			// format of map = [0,0,0,0,1,1,1,1,1,0...]
			var cPos = 0; // current position in 2 d array
			for(g in m){ // loop through each group
				var group = m[g];

				// get x and y start and end values
				var xs = typeof(group[0]) !== 'number' ? group[0][0] : group[0];
				var xe = typeof(group[0]) !== 'number' ? group[0][1] : group[0];
				var ys = typeof(group[1]) !== 'number' ? group[1][0] : group[1];
				var ye = typeof(group[1]) !== 'number' ? group[1][1] : group[1];

				// convert [x,y] start value to 2d array index.
				// add [0] tiles to map array from cPos to
				// calculated start value, then add [1] tiles
				// to map array from start value to end value.
				for(;cPos < (ys*that.tileW)+xs; cPos++){
					map[cPos] = 0;
				}
				for(;cPos < (ye*that.tileW)+xe; cPos++){
					map[cPos] = 1;
				}
			}
			// after all platforms are created, complete map array
			// with [0] tiles.
			for(;cPos < that.tileW * that.tileH; cPos++){
				map[cPos] = 0;
			}

			// loop through enemies array and create them
			// then add them to object queue
			for(var i = 0; i < enemies.length; i++){
				var group = m[enemies[i][0]]; // get enemy group
				var sprite = enemies[i][1]; // get enemy sprite
				var thisEnemy = new Enemy(game, group, sprite); // create new enemy
				game.objQ.push(thisEnemy); // add to object queue
			}

			// create the hero and add to object queue
			var hero = new Hero(game, 0, 38, 'hero');
			game.objQ.push(hero);
		};

		this.update = function(i){
			// update total time played
			game.timePlayed += i;
		};

		this.draw = function(){
			// draw each tile
			for(i in map){
				var tx = i % game.tileW;
				var ty = parseInt(i / game.tileW);
				sprites.draw(sprite, tx*game.ts,ty*game.ts,(tileGroup*2) + 1);
				if(map[i] === 1){
					sprites.draw(sprite, tx*game.ts,ty*game.ts,(tileGroup*2) + 0);
				}
			}

			// draw current level and time elapsed
			game.cx.fillStyle="#FFF"; //set background color
			game.cx.fillRect(0, 0, game.w, game.topStart * game.ts); //fill background
			game.cx.fillStyle=txtColor;
			game.cx.font = "12px verdana";
			game.cx.fillText("Current Level: " + game.currLevel, 70, 25);
			game.cx.fillText("Lapsed Time: " + (game.timePlayed/1000).toFixed(2) + " seconds", 230, 25);
		};

		this.getMap = function(){
			return map; // return map
		};
		this.getTile = function(x,y){
			// return 0 or 1 for tile and [x,y] position
			var pos = (y * game.tileW) + x;
			return map[pos];
		};

		this.init(); // initialize level

		return this;
	};
	
	this.init(); //initialize game
	
	return this;
};