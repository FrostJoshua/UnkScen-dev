var left = document.getElementById('left');
var up = document.getElementById('up');
var right = document.getElementById('right');
var down = document.getElementById('down');

left.addEventListener('click',function(){vibrate(30)})
up.addEventListener('click',function(){vibrate(100)})
right.addEventListener('click',function(){vibrate(300)})
down.addEventListener('click',function(){vibrate(700)})

function vibrate(ms)
{
  console.log("clicked")
    window.navigator.vibrate(ms);
    
}