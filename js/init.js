var languages;
var songs;
var animations = Array();
var timer;
var currentTime;
var animationFrame;

//-----
// KEYS
//-----
var keyState = {};
var lockedKeys = {};

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;

var KEY_A = 65;
var KEY_W = 87;
var KEY_D = 69;
var KEY_S = 83;

window.addEventListener('keydown',function(e){
	keyState[e.keyCode || e.which] = true;
},true);

window.addEventListener('keyup',function(e){
	keyState[e.keyCode || e.which] = false;
},true);

var soundQueue = new createjs.LoadQueue();
//createjs.Sound.alternateExtensions = ["mp3"];
soundQueue.installPlugin(createjs.Sound);
//soundQueue.addEventListener("fileload", handleFileLoad);
soundQueue.addEventListener("complete", handleComplete);
soundQueue.loadManifest([
	{id:"vinylScratch", src:"./audio/vinyl-scratch.wav"},
	{id:"metronome", src:"./audio/metronome.wav"}
]);

function handleComplete(){
	//createjs.Sound.play("vinylScratch");
	//loadSongsMenu();
	var menu = new Menu();
	loadSongs(menu);
	//menu.songsLoaded(menu);
	// if (loadSongs() == 1){
	// 	console.log("ENTRA");
	// 	menu.songsLoaded(menu);
	// }
}

function songsLoaded(obj){
	obj.songsLoaded(obj);
}

// Following code by Tomáš Zato (http://stackoverflow.com/users/607407/tom%c3%a1%c5%a1-zato)
// From Stack Overflow (http://stackoverflow.com/a/14853974)
// Question by Julian H. Lam (http://stackoverflow.com/users/122353/julian-h-lam)
// CC BY-SA 3.0 license
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
		// if the other array is a falsy value, return
		if (!array)
				return false;

		// compare lengths - can save a lot of time 
		if (this.length != array.length)
				return false;

		for (var i = 0, l=this.length; i < l; i++) {
				// Check if we have nested arrays
				if (this[i] instanceof Array && array[i] instanceof Array) {
						// recurse into the nested arrays
						if (!this[i].equals(array[i]))
								return false;       
				}           
				else if (this[i] != array[i]) { 
						// Warning - two different object instances will never be equal: {x:20} != {x:20}
						return false;   
				}           
		}       
		return true;
}   

// Following code by Juan Mendes (http://stackoverflow.com/users/227299/juan-mendes)
// From Stack Overflow (http://stackoverflow.com/a/3368118)
// Question by DNB5brims (http://stackoverflow.com/users/148978/dnb5brims)
// CC BY-SA 3.0 license
/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}        
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());