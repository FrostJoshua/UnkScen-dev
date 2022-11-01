var left = document.getElementById('left');
var up = document.getElementById('up');
var right = document.getElementById('right');
var down = document.getElementById('down');

left.addEventListener('click',vibrate(30))
up.addEventListener('click',vibrate(100))
right.addEventListener('click',vibrate(300))
down.addEventListener('click',vibrate(700))

function vibrate(ms)
{
    navigator.vibrate(ms);
}