var left = document.getElementById('left');
var up = document.getElementById('up');
var right = document.getElementById('right');
var down = document.getElementById('down');

left.addEventListener('click',function(){vibrate(randomInteger(500,1000))})
up.addEventListener('click',function(){vibrate(randomInteger(500,1000))})
right.addEventListener('click',function(){vibrate(randomInteger(500,1000))})
down.addEventListener('click',function(){vibrate(randomInteger(500,1000))})

function vibrate(ms)
{
  console.log("clicked")
    window.navigator.vibrate(ms);
    
}

function randomInteger(min, max) {
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    if (rand < 600)
    {
return 50
    }
    else
    {
    return rand
    }
  }