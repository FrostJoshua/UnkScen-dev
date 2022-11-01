var left = document.getElementById('left');
var up = document.getElementById('up');
var right = document.getElementById('right');
var down = document.getElementById('down');
var inSpace = 0;
var progress = 0;
var healthDiv = document.getElementById("health");
var health = 100;
var progressDiv = document.getElementById("progress");
left.addEventListener('click',function(){vibrate(randomInteger(300,500,0))});
up.addEventListener('click',function(){vibrate(randomInteger(300,500,1))});
right.addEventListener('click',function(){vibrate(randomInteger(300,500,2))});
down.addEventListener('click',function(){vibrate(randomInteger(300,500,3))});

function vibrate(ms)
{
 
    window.navigator.vibrate(ms);
    
}

function randomInteger(min, max,space) {
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    if (space == inSpace)
    {
        nextSpace()
        progress++
        progressDiv.innerText=progress;
    return [50,100,50,100,50]
    }
    else
    {
        health--
        healthDiv.innerText=health;
    return rand
    }
  }

  function nextSpace() {
    var nextSpace = Math.floor(Math.random() * (4 - 0 + 1)) + 0;
    inSpace = nextSpace;
  }