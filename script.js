var leftDiv = document.getElementById('left');
var upDiv = document.getElementById('up');
var rightDiv = document.getElementById('right');
var attackDiv = document.getElementById('attack');
var downDiv = document.getElementById('down');
var movement = document.getElementById('movement');
var healthDiv = document.getElementById("health");
var progressDiv = document.getElementById("progress");
var progress = 0;
var nextSpace = 0;
var audioLoaded = false;
var stepPlays = 2;
var stepCount = 0;
var up = false;
var right = false;
var down = false;
var left = false;
var attack = false;
var gameTick= 600;
var action = false;
var obstacle = false;
var obstacleHealth = 0;
var facing = false;
var loopVar = 0;
prevSpace = 0;


//audio
const stepAudio = new Audio
stepAudio.src = "steps.ogg"
stepAudio.load();
const obHit = new Audio
obHit.src = "obHit.wav"
obHit.load();
const obMiss = new Audio
obMiss.src = "swing.wav"
obMiss.load();
const wallAudio = new Audio
wallAudio.src = "wall.wav"
wallAudio.load();
const windAudio = new Audio
windAudio.src = "wind.wav"
windAudio.volume = .5;
windAudio.loop=true;
windAudio.load();
const evilAudio = new Audio
evilAudio.src = "evil.ogg"
windAudio.volume = 1;
evilAudio.loop=true;
evilAudio.load();
const breakAudio = new Audio
breakAudio.src = "break.ogg"
breakAudio.load();


//gameloop
setInterval(() => {
    gameLoop();
}, 50);

//start game
setTimeout(function(){if (nextSpace == 0){createSpace();}},1000)

//listeners
document.addEventListener('keydown',press)
function press(e){
  if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */){
    up = true
  }
  if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
    right = true
  }
  if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
    down = true
  }
  if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */){
    left = true
  }
  if (e.keyCode === 32 /* space */ || e.keyCode === 69 /* e */ || e.keyCode === 16 /* shift */){
    attack = true
  }
}
document.addEventListener('keyup',release)
function release(e){
  if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */){
    up = false
  }
  if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
    right = false
  }
  if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
    down = false
  }
  if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */){
    left = false
  }
  if (e.keyCode === 32 /* space */ || e.keyCode === 69 /* e */ || e.keyCode === 16 /* shift */){
    attack = false
  }
}
leftDiv.addEventListener('click',function(){facing = 0;movePlayer()});
upDiv.addEventListener('click',function(){facing = 1;movePlayer()});
rightDiv.addEventListener('click',function(){facing = 2;movePlayer()});
downDiv.addEventListener('click',function(){facing = 3;movePlayer()});
attackDiv.addEventListener('click',function(){clickAttack()});



function vibrate(ms)
{
 
window.navigator.vibrate(ms);
    
}



  function movePlayer()
  {
    if (!audioLoaded)
    {
        audioLoaded = true;
        windAudio.play();
        evilAudio.play();
    }

   action = true;
   setTimeout(function(){action=false},gameTick)
   
    if (facing == nextSpace)
    {
        if (obstacle == false)
        {
            prevSpace == nextSpace;
            vibrate([150, 250, 150, 250, 150]);
            createSpace()
            stepForward(1)
          
        }
        else
        {
            vibrate(200);
            wallStop();
       
        }
    }
    else
    {
        vibrate(200);
        wallStop();

    }

  }


function createSpace(){

progressDiv.innerText=progress
    checkSpace = randomIntFromInterval(0,3);
    if (checkSpace == prevSpace-2 || checkSpace == prevSpace+2)
    {createSpace()}
    else
    {nextSpace = checkSpace;createObstacle();progress = progress+1}
    
}


function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  function stepForward(){
    stepAudio.volume = 1;
    stepAudio.play();
    stepAudio.addEventListener('ended', removeRepeat);
  }

function removeRepeat()
{
    if (loopVar < stepPlays){
        stepAudio.play();
        loopVar = loopVar+1;
    }
    else
    {
        stepAudio.removeEventListener('ended', removeRepeat);
        loopVar = 0;
    }
    
    
}

function wallStop(){
    wallAudio.volume = .2;
    wallAudio.play();
  }


function gameLoop(){
    
    if (up && action == false){
        facing = 0
        movePlayer();
    }
    if (right && action == false){
        facing = 1
        movePlayer();
    }
    if (down && action == false){
        facing = 2
        movePlayer();
    }
    if (left && action == false){
        facing = 3
        movePlayer();
    }
    if (attack && action == false && facing == nextSpace && obstacle == true){
        attackObstacle();
    }
    if (attack && action == false && facing != nextSpace){
        missObstacle();
    }
    if (attack && obstacle == false && action == false){
        missObstacle();
    }
  }

  function createObstacle(){
    var randChance = randomIntFromInterval(0,9);
    var randHealth = randomIntFromInterval(1,3);
    
    if (randChance < 2)
    {

        obstacle = true;
        obstacleHealth = randHealth;
    }
  }

  function attackObstacle()
  {
    obstacleHealth = obstacleHealth-1;
    obHit.play();
    if (obstacleHealth == 0)
    {
        obstacle = false;
        breakAudio.play();
    }
    action = true;
   setTimeout(function(){action=false},gameTick)
  }


  function missObstacle(){
    obMiss.play();
    action = true;
    setTimeout(function(){action=false},gameTick)
  }
  function clickAttack(){
        if (!audioLoaded)
    {
        audioLoaded = true;
        windAudio.play();
        evilAudio.play();
    }
    if (action == false && facing == nextSpace && obstacle == true){
        attackObstacle();
    }
    if (action == false && facing != nextSpace){
        missObstacle();
    }
    if (obstacle == false && action == false){
        missObstacle();
    }
  }