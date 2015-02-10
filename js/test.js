//----
//KEYS
//----
var keyState = {};

window.addEventListener('keydown',function(e){
	keyState[e.keyCode || e.which] = true;
},true);

window.addEventListener('keyup',function(e){
	keyState[e.keyCode || e.which] = false;
},true);

var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;

//----
//TIME
//----
var tNow = 0;
var start;

//-----
//SONGS
//-----
load_songs();

//TODO: Change to load proper song
function startGame(){
	var song = JSON.parse(songs.memories);
	//setTimeout(function(){console.log(songs);},4000);
	start = new Date();

	//Initialize some song stuff: array of successful steps, step error margin, etc.
	//Format of stepsArray item: {step_number: [steps, is_playable]}
	//	float	step_number: equals measure defined in song.js
	//	int		steps: number of steps needed to complete this step, equals length of second item in each song item
	//	bool	is_playable: defines if this note can still be played or otherwise was missed, defaults to true
	var stepsArray = {};
	for(var i=0; i<song.song.length; i++){
		stepsArray[song.song[i][0]] = [song.song[i][1].length, true];
	}
	console.log(stepsArray);
	gameLoop(song);
}

function gameLoop(song) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	testKeys();

	var tDelta = tNow;
	var d = new Date();
	var t = d.toLocaleTimeString();
	tNow = d-start;
	tDelta = tNow - tDelta;

	drawSong(song, tNow);

	setTimeout(function(){
		gameLoop(song);
	}, 10);
}

function testKeys() {
	/* Keys down */
	if (keyState[37] || keyState[65]){ // left
		console.log("left");
		keyLeft = true;
		context.drawImage(img[0],32,80,96,96);
	}
	if (keyState[38] || keyState[87]){ // up
		console.log("up");
		keyUp = true;
		context.drawImage(img[1],192,80,96,96);
	}
	if (keyState[39] || keyState[68]){ // right
		console.log("right");
		keyRight = true;
		context.drawImage(img[3],512,80,96,96);
	}
	if (keyState[40] || keyState[83]){ // down
		console.log("down");
		keyDown = true;
		context.drawImage(img[2],352,80,96,96);
	}



	/* Keys up */
	if (!keyState[37] && !keyState[65]){ // left
		//console.log("no left");
		keyLeft = false;
		context.drawImage(img[0],16,64);
	}
	if (!keyState[38] && !keyState[87]){ // up
		keyUp = false;
		context.drawImage(img[1],176,64);
	}
	if (!keyState[39] && !keyState[68]){ // right
		keyRight = false;
		context.drawImage(img[3],496,64);
	}
	if (!keyState[40] && !keyState[83]){ // down
		keyDown = false;
		context.drawImage(img[2],336,64);
	} 
}

function drawSong(song) {
	var currentMeasure = Math.round((song.bpm/60)*(tNow/1000)*10000) / 10000;
	//console.log(currentMeasure);

	for(var i=0; i<song.song.length; i++){
		for(var noteSteps=0; noteSteps<song.song[i][1].length; noteSteps++){
			//console.log(song.song[i][1][noteSteps]);
			context.drawImage(img[song.song[i][1][noteSteps]],16+song.song[i][1][noteSteps]*160,song.song[i][0]*(96+32*song.difficulty)-((96+32*song.difficulty)*currentMeasure));
		}
	}
}