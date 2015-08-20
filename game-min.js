var Game=function(cid,w,h,callback){var that=this;var txtColor="#333";var fps=30;var resourcesFile='resources.json';document.addEventListener('keydown',function(e){var key=e.keyCode;var index=that.keysPressed.indexOf(key);if(index===-1){that.keysPressed.push(key);}});document.addEventListener('keyup',function(e){var key=e.keyCode;var index=that.keysPressed.indexOf(key);if(index>-1){that.keysPressed.splice(index,1);}});var ca=this.ca=document.getElementById(cid);var cx=this.cx=ca.getContext('2d');this.ts=20;this.ca.setAttribute('width',w*this.ts);this.ca.setAttribute('height',h*this.ts);this.tileW=w;this.tileH=h;this.w=parseInt(this.ca.getAttribute('width'));this.h=parseInt(this.ca.getAttribute('height'));this.topStart=2;this.objQ=[];this.iLoaded=false;this.tick=new Date().getTime();this.utick=new Date().getTime();this.currLevel=0;this.levelObj;this.keysPressed=[];this.timePlayed=0;this.init=function(){this.loadResourses();if(this.iLoaded==false){var wait=function(){if(this.iLoaded==false){setTimeout(wait,300);}else{this.loadLevel('start');callback.apply(this);}};setTimeout(wait,300);}};this.update=function(){n=new Date().getTime();var i=n-this.utick;if(this.levelObj!==undefined){this.levelObj.update(i);}
for(o in this.objQ){if(this.objQ[o]!==undefined){this.objQ[o].update(i);}}
this.utick=n;};this.draw=function(){this.cx.clearRect(0,0,this.w,this.h);if(this.levelObj!==undefined){this.levelObj.draw();}
for(o in this.objQ){if(this.objQ[o]!==undefined){this.objQ[o].draw();}}};this.run=function(){that.update();var thisTick=new Date().getTime();var i=thisTick-that.tick;if(i>=1000 / fps){that.draw();that.tick=thisTick;}};this.loadLevel=function(l){this.objQ=[];if(l==='start'){this.levelObj=new startScreen();}else if(l==='over'){this.levelObj=new overScreen();}else{this.objQ=[];this.currLevel=l;this.levelObj=new Level(this,'tile');}};this.loadResourses=function(){var client=new XMLHttpRequest();client.open('GET',resourcesFile);client.onreadystatechange=function(){if(client.readyState==4){var jData=JSON.parse(client.responseText);var spriteData=jData.sprites;var spriteSheet=jData.spriteSheet;sprites.load(spriteSheet,spriteData,function(){that.iLoaded=true;});}}
client.send();};var sprites=new function(){this.data={};this.load=function(rImage,data,callback){this.data=data;this.image=new Image();this.image.onload=callback;this.image.src=rImage;};this.draw=function(sprite,x,y,frame){var s=this.data[sprite];frame=!frame?0:frame;cx.drawImage(this.image,s.sx+frame*s.w,s.sy,s.w,s.h,x,y,s.w*s.dimM,s.h*s.dimM);};};var startScreen=function(){this.update=function(){if(that.keysPressed.indexOf(13)>-1){that.loadLevel(1);}};this.draw=function(){if(that.cx!==undefined){that.cx.fillStyle=txtColor;that.cx.font="48px verdana";that.cx.textAlign="center";that.cx.fillText("Gravity Control",that.w/2,(that.h/2)-75);that.cx.font="14px verdana";that.cx.fillText("The world as we know it has ended, even Gravity is out of wack.",that.w/2,that.h/2);that.cx.fillText("Your mission is to defeat all the blobs on your way to the big red button.",that.w/2,that.h/2+30);that.cx.fillText("The big red button is the key to righting the Gravity problem.",that.w/2,that.h/2+60);that.cx.font="10px verdana";that.cx.fillText("{left and right arrow} move from side to side, {space} fire, {up arrow} use jetpack.  You must be on a tile to use the jetpack.",this.w/2,this.h/2+90);that.cx.font="14px verdana";that.cx.fillText("Press ENTER to start.",that.w/2,that.h/2+140);}};};var overScreen=function(){var totalTime=that.timePlayed;that.timePlayed=0;this.update=function(){if(that.keysPressed.indexOf(27)>-1){that.loadLevel('start');}else if(that.keysPressed.indexOf(13)>-1){that.loadLevel(1);}};this.draw=function(){if(that.cx!==undefined){that.cx.fillStyle=txtColor;that.cx.font="48px verdana";that.cx.fillText("Game Over",that.w/2,that.h/2-100);that.cx.font="16px verdana";that.cx.fillText("You completed "+(that.currLevel-1)+" levels in "+(totalTime/1000).toFixed(2)+" seconds.",that.w/2,that.h/2-50);that.cx.font="12px verdana";that.cx.fillText("Press ESC to go back to start screen.",that.w/2,that.h/2+20);that.cx.fillText("Press ENTER to go restart at level 1.",that.w/2,that.h/2+50);}};};var Hero=function(game,x,y,sprite){this.x=x;this.y=y;this.frame=1;this.s=sprite;this.dx=0;this.dy=0;this.xTick=0;this.yTick=0;this.jetpack=false;this.jetpackTimer=5000;this.fireTick=0;var that=this;var chkCol=function(t,h,e){if(t=="map"){var yBelow=Math.ceil(that.y)-1;var xBelow1=Math.floor(that.x);var xBelow2=Math.ceil(that.x);var tileBelow1=game.levelObj.getTile(xBelow1,yBelow);var tileBelow2=game.levelObj.getTile(xBelow2,yBelow);if(tileBelow1==1||tileBelow2==1){return true;}
return false;}else{var abs=Math.abs;return(abs(h.x-e.x)*2<(1))&&(abs(h.y-e.y)*2<(1));}};this.update=function(i){this.xTick+=i;this.yTick+=i;this.fireTick+=i;var left=game.keysPressed.indexOf(37);var right=game.keysPressed.indexOf(39);var jetpack=game.keysPressed.indexOf(40);var fire=game.keysPressed.indexOf(32);this.jetpack=jetpack>-1?true:false;this.jetpackTimer=this.jetpack?this.jetpackTimer-i:this.jetpackTimer;if(this.jetpackTimer<=0){this.jetpack=false;this.jetpackTimer=0;}
this.dx=left>-1?-0.25:right>-1?0.25:0;if(fire>-1)this.fire();if(this.jetpack){this.dy=0.25;}else{if(this.y%1==0){if(chkCol('map')){this.dy=0;this.yTick=0;}else{this.dy=-0.25;}}}
if(this.xTick>=50){this.x+=this.dx;this.xTick=0;}
if(this.yTick>=50){this.y+=this.dy;this.yTick=0;}
var f=this.frame;if(this.dx>0){f=1;}else if(this.dx<0){f=0;}
if(this.jetpack&&(f==1||f==0)){f=f+2;}else if(!this.jetpack&&(f>1)){f=f-2;}
this.frame=f;if(this.x*game.ts>game.w||this.x*game.ts<0||this.y*game.ts>game.h||this.y*game.ts<game.topStart){game.loadLevel('over');}
var levelOver=true;for(var i in game.objQ){if(game.objQ[i].constructor.name=='Enemy'){levelOver=false;e=game.objQ[i];if(chkCol('enemy',this,e)){game.loadLevel('over');break;}}}
if(levelOver)loadLevel(game.currLevel+1);};this.draw=function(){game.cx.fillStyle=txtColor;game.cx.font="12px verdana";game.cx.fillText("Jetpack time remaining: "+(this.jetpackTimer/1000).toFixed(2)+" seconds",game.w-140,25);sprites.draw(this.s,this.x*game.ts,this.y*game.ts,this.frame);};this.fire=function(){if(this.fireTick>250){var dir=[1,3].indexOf(this.frame)==-1?-1:1;var bullet=new Bullet(game,this.x,this.y,dir,'bullet');game.objQ.push(bullet);this.fireTick=0;}};};var Bullet=function(game,x,y,dir,sprite){this.s=sprite;this.x=x;this.y=y;this.dir=dir;this.animTick=0;var chkCol=function(b,e){var abs=Math.abs;return(abs(b.x-e.x)*2<(1))&&(abs(b.y-e.y)*2<(1));};this.destroy=function(){var index=game.objQ.indexOf(this);if(index>-1){game.objQ.splice(index,1);}};this.update=function(i){this.animTick+=i;if(this.animTick>=25){this.x+=dir>0?0.25:-0.25;this.animTick=0;}
for(var i in game.objQ){if(game.objQ[i].constructor.name=='Enemy'){e=game.objQ[i];if(chkCol(this,e)){this.destroy();e.destroy();break;}}}
if(this.x>game.tileW||this.x<0||this.y>game.tileH||this.y<0){this.destroy();}};this.draw=function(){sprites.draw(this.s,this.x*game.ts,this.y*game.ts);};return this;};function Enemy(game,group,sprite){this.s=sprite;this.frame=0;this.xtick=0;this.ytick=0;this.xs=typeof(group[0])!=='number'?group[0][0]:group[0];this.xe=typeof(group[0])!=='number'?group[0][1]-1:group[0]-1;this.ys=typeof(group[1])!=='number'?group[1][0]:group[1];this.ye=typeof(group[1])!=='number'?group[1][1]-1:group[1]-1;this.x=Math.floor(Math.random()*(this.xe-this.xs))+this.xs;this.y=Math.floor(Math.random()*(this.ye-this.ys))+(this.ys+2);this.dx=((Math.random()*100)+25)*(Math.ceil((Math.random()*2))===1?1:-1);this.dy=0;this.dir=this.dx<0?0:2;this.animTick=0;var that=this;this.update=function(i){this.animTick+=i;this.xtick+=i;this.ytick+=i;if(this.animTick>=250){this.frame++;if(this.frame>1)this.frame=0;this.animTick=0;}
if(this.xtick>=Math.abs(this.dx)){this.x+=this.dx<0?-0.25:this.dx==0?0:0.25;this.xtick=0;if(this.x>=this.xe||this.x<=this.xs){this.x=this.x>=this.xe?this.xe:this.xs;this.dx*=-1;this.dir=this.dx<0?0:2;}}
if(this.ytick>=Math.abs(this.dy)){this.y+=this.dy<0?-0.25:this.dy==0?0:0.25;this.ytick=0;if(this.y==this.ye||this.y==this.ys){this.dy*=-1;}}};this.draw=function(){sprites.draw(this.s,this.x*game.ts,this.y*game.ts,this.frame+this.dir);};this.destroy=function(){var index=game.objQ.indexOf(this);if(index>-1){game.objQ.splice(index,1);}};return this;};var Level=function(game,s){var map=[];var tileGroup=Math.floor(Math.random()*2);var sprite=s;this.init=function(){var m=[];var enemies=[];var platforms=Math.ceil(Math.random()*2)+4;var yVals=[];var lastVal=-1;for(var n=0;n<=platforms;n++){var tY=Math.floor(Math.random()*4)+lastVal+4;if(tY<35){var tX1=Math.floor(Math.random()*(game.tileW / 2))+1;var tX2=Math.floor(Math.random()*((game.tileW / 2)-10))+(game.tileW / 2)+10;var xVal=[tX1,tX2];var thisP=[xVal,tY];m.push(thisP);var e=Math.floor((tX2-tX1)/3);for(var i=0;i<=e;i++){enemies.push([n,"zombie"]);}
lastVal=tY;}}
m.push([[0,1],37]);var cPos=0;for(g in m){var group=m[g];var xs=typeof(group[0])!=='number'?group[0][0]:group[0];var xe=typeof(group[0])!=='number'?group[0][1]:group[0];var ys=typeof(group[1])!=='number'?group[1][0]:group[1];var ye=typeof(group[1])!=='number'?group[1][1]:group[1];for(;cPos<(ys*that.tileW)+xs;cPos++){map[cPos]=0;}
for(;cPos<(ye*that.tileW)+xe;cPos++){map[cPos]=1;}}
for(;cPos<that.tileW*that.tileH;cPos++){map[cPos]=0;}
for(var i=0;i<enemies.length;i++){var group=m[enemies[i][0]];var sprite=enemies[i][1];var thisEnemy=new Enemy(game,group,sprite);game.objQ.push(thisEnemy);}
var hero=new Hero(game,0,38,'hero');game.objQ.push(hero);};this.update=function(i){game.timePlayed+=i;};this.draw=function(){for(i in map){var tx=i%game.tileW;var ty=parseInt(i / game.tileW);sprites.draw(sprite,tx*game.ts,ty*game.ts,(tileGroup*2)+1);if(map[i]===1){sprites.draw(sprite,tx*game.ts,ty*game.ts,(tileGroup*2)+0);}}
game.cx.fillStyle="#FFF";game.cx.fillRect(0,0,game.w,game.topStart*game.ts);game.cx.fillStyle=txtColor;game.cx.font="12px verdana";game.cx.fillText("Current Level: "+game.currLevel,70,25);game.cx.fillText("Lapsed Time: "+(game.timePlayed/1000).toFixed(2)+" seconds",230,25);};this.getMap=function(){return map;};this.getTile=function(x,y){var pos=(y*game.tileW)+x;return map[pos];};this.init();return this;};this.init();return this;};