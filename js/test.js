//----
//KEYS
//----
var keyState = {};
var keyStatePrevious = {};
var countKeyStatePrevious = 0;

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

var arrowKeys = [false, false, false, false];
var countArrowKeys = 0;

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var KEY_A = 65;
var KEY_W = 87;
var KEY_D = 69;
var KEY_S = 83;

var ARROW_LEFT = 0;
var ARROW_UP = 1;
var ARROW_DOWN = 2;
var ARROW_RIGHT = 3;

//Only compare steps that are set to true, set to false those that are pressed when a new note is in play
var canPlay = [true, true, true, true];

//----
//TIME
//----
var tNow = 0;
var start;
var timer;

//-----------------
//SOME USEFUL STUFF
//-----------------
var playableSteps;
var playableStepsArray = new Array();
var playableStepsCount = 0;
var noteError = false;
var currentRightSteps = 0;
var fakeSteps = 0;
var marginToAdd;

//-----
//SONGS
//-----
var errorMargin = 0.5; //maximum threshold in bpm by default/exceed to successfully play a step
var stepsArray; //basic step data: number of steps, whether it is playable or not, playability range
var stepsArrayKeys; //stores the measures on which every song step is triggered
var currentStep; //step number (not measure) to be played
load_songs();

//TODO: Change to load proper song
function startGame(){
	var song = JSON.parse(songs.memories);
	//setTimeout(function(){console.log(songs);},4000);
	start = new Date();

	//Initialize some song stuff: object of successful steps, step error margin, etc.
	//Format of stepsArray object: {step_number: [steps, is_playable, margin_by_default, margin_by_excess]}
	//	float	step_number: equals measure defined in song.js
	//	int		steps: number of steps needed to complete this step, equals length of second item in each song item
	//	bool	is_playable: defines if this note can still be played or otherwise was missed, defaults to true
	//	float	margin_by_default: the amount of measures a step can be played before the actual step happens
	//	float	margin_by_excess: the amount of measures a step can be played after the actual step happens
	stepsArray = {};
	stepsArrayKeys = [];
	for(var i=0; i<song.song.length; i++){
		if(i==0){
			var marginByDefault = song.song[i][0] - errorMargin;
		}else{
			var marginByDefault = song.song[i][0] - Math.min(errorMargin, (song.song[i][0]-song.song[i-1][0])/2);
		}
		if(i==song.song.length-1){
			var marginByExcess = song.song[i][0] + errorMargin;
		}else{
			var marginByExcess = song.song[i][0] + Math.min(errorMargin, (song.song[i+1][0]-song.song[i][0])/2);
		}
		stepsArray[song.song[i][0]] = {steps:song.song[i][1].length, is_playable:true, margin_by_default:marginByDefault, margin_by_excess:marginByExcess};
		stepsArrayKeys.push(song.song[i][0]);
	}

	currentStep = 0;

	timer = new Tock({
		interval: 10,
		callback: function(){gameLoop(song);}
	});
	
	//console.log(stepsArray);
	//console.log(stepsArrayKeys);
	timer.start();
	//gameLoop(song);
}

function gameLoop(song) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	testKeys();

	// var tDelta = tNow;
	// var d = new Date();
	// var t = d.toLocaleTimeString();
	// tNow = d-start;
	// tDelta = tNow - tDelta;

	drawSong(song, timer.lap());

	// setTimeout(function(){
	// 	gameLoop(song);
	// }, 10);
}

function testKeys() {
	/* Keys down */
	if (keyState[37] || keyState[65]){ // left, 'a'
		//console.log("left");
		keyLeft = true;
		context.drawImage(img[0],32,80,96,96);
	}
	if (keyState[38] || keyState[87]){ // up, 'w'
		//console.log("up");
		keyUp = true;
		context.drawImage(img[1],192,80,96,96);
	}
	if (keyState[39] || keyState[68]){ // right, 'd'
		//console.log("right");
		keyRight = true;
		context.drawImage(img[3],512,80,96,96);
	}
	if (keyState[40] || keyState[83]){ // down, 's'
		//console.log("down");
		keyDown = true;
		context.drawImage(img[2],352,80,96,96);
	}

	/* Keys up */
	if (!keyState[37] && !keyState[65]){ // left, 'a'
		//console.log("no left");
		keyLeft = false;
		context.drawImage(img[0],16,64);
	}
	if (!keyState[38] && !keyState[87]){ // up, 'w'
		keyUp = false;
		context.drawImage(img[1],176,64);
	}
	if (!keyState[39] && !keyState[68]){ // right, 'd'
		keyRight = false;
		context.drawImage(img[3],496,64);
	}
	if (!keyState[40] && !keyState[83]){ // down, 's'
		keyDown = false;
		context.drawImage(img[2],336,64);
	} 
}

function drawSong(song, time) {
	var currentMeasure = Math.round((song.bpm/60)*(time/1000)*10000) / 10000;
	//console.log(currentStep);
	//if(stepsArrayKeys.hasOwnProperty(currentStep))
	//	console.log(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess + " -- " + currentMeasure);

	//--------------
	//PAINT THE SONG
	//--------------
	for(var i=0; i<song.song.length; i++){
		for(var noteSteps=0; noteSteps<song.song[i][1].length; noteSteps++){
			//console.log(song.song[i][1][noteSteps]);
			var yPos = song.song[i][0]*(96+32*song.difficulty)-((96+32*song.difficulty)*currentMeasure)+64;
			if(yPos > -128 && yPos < 1088 && stepsArray[song.song[i][0]].is_playable)
				context.drawImage(img[song.song[i][1][noteSteps]],16+song.song[i][1][noteSteps]*160,yPos);
		}
	}

	//----------
	//CHECK KEYS
	//----------
	//console.log(keyState);
	if(song.song.hasOwnProperty(currentStep)){
		noteError = false;
		currentRightSteps = 0;
		fakeSteps = 0;
		playableSteps = song.song[currentStep][1];
		playableStepsCount = 0;
		playableStepsArray.length = 0;
		for(var i=0; i<4; i++){
			if(playableSteps.indexOf(i) > -1){
				playableStepsArray.push(true);
				playableStepsCount++;
			}
			else
				playableStepsArray.push(false);
		}
		arrowKeys = [
			typeof keyState[KEY_LEFT] === "undefined" ? false : keyState[KEY_LEFT],
			typeof keyState[KEY_UP] === "undefined" ? false : keyState[KEY_UP],
			typeof keyState[KEY_DOWN] === "undefined" ? false : keyState[KEY_DOWN],
			typeof keyState[KEY_RIGHT] === "undefined" ? false : keyState[KEY_RIGHT]
		];
		//if(playableStepsArray.equals(arrowKeys))
			//console.log("OK");

		//-------------------------------------------------------------
		//CHECKS IF NOTE IS PLAYABLE AND MEASURE IS WITHIN ERROR MARGIN
		//-------------------------------------------------------------
		if(
			currentMeasure >= stepsArray[stepsArrayKeys[currentStep]].margin_by_default &&
			currentMeasure <= stepsArray[stepsArrayKeys[currentStep]].margin_by_excess &&
			stepsArray[stepsArrayKeys[currentStep]].is_playable
		){
			//Ignore if the number of pressed steps is lower than that of the previous iteration
			/*countArrowKeys = 0;
			for(var i=0; i<4; i++){
				if(arrowKeys[i])
					countArrowKeys++;
			}
			
			if(countArrowKeys == 0)
				canPlay = true;

			countKeyStatePrevious = 0;
			for(var i=0; i<4; i++){
				if(keyStatePrevious[i])
					countKeyStatePrevious++;
			}
			if(countArrowKeys >= countKeyStatePrevious && canPlay){
				//For all that's holy WTF am I doing here?
			}*/
			//Compare canPlay's true items with pressed steps and valid note steps
			for(var i=0; i<4; i++){
				//If the player releases a step that is marked as fake, mark it as playable
				if(canPlay[i] == false && arrowKeys[i] == false){
					canPlay[i] = true;
				}

				if(noteError == false && canPlay[i] == true){
					if(arrowKeys[i] != playableStepsArray[i] && playableStepsArray[i] == false)
						noteError = true;
					else if(arrowKeys[i] == true && playableStepsArray[i] == true)
						currentRightSteps++;
				}
				//If the player has an unplayable step pressed, the note cannot be held as valid
				if(noteError == false && canPlay[i] == false && arrowKeys[i] == true)
					fakeSteps++;
			}

			//------------------------------------------------------------
			//THE NOTE IS PLAYABLE AND ALL THE STEPS ARE RIGHT. WELL DONE!
			//------------------------------------------------------------
			if(playableStepsArray.equals(arrowKeys) && fakeSteps == 0 && noteError == false){
				console.log("OK");
				//TODO: Give some points according to error margin
				marginToAdd = Math.min(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess - currentMeasure, errorMargin);
				if(stepsArray.hasOwnProperty(currentStep+1)){
					stepsArray[stepsArrayKeys[currentStep]].margin_by_default = Math.max(stepsArray[stepsArrayKeys[currentStep]] - marginToAdd, stepsArray[stepsArrayKeys[currentStep]] - errorMargin);
				}
				//Set canPlay according to pressed steps
				for(var i=0; i<4; i++)
					canPlay[i] = !arrowKeys[i];
				stepsArray[stepsArrayKeys[currentStep]].is_playable = false;
				currentStep++;
				//console.log("-----------");
			}

			//------------------------------------
			//OOPS, MISTAKE MADE, NEXT NOTE ANYWAY
			//------------------------------------
			if(noteError == true){
				console.log("ERROR");
				var marginToAdd = Math.min(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess - currentMeasure, errorMargin);
				if(stepsArray.hasOwnProperty(currentStep+1)){
					stepsArray[stepsArrayKeys[currentStep]].margin_by_default = Math.max(stepsArray[stepsArrayKeys[currentStep]] - marginToAdd, stepsArray[stepsArrayKeys[currentStep]] - errorMargin);
				}
				//Set canPlay according to pressed steps
				for(var i=0; i<4; i++)
					canPlay[i] = !arrowKeys[i];
				stepsArray[stepsArrayKeys[currentStep]].is_playable = false;
				currentStep++;
				//console.log("-----------");
			}
		}

		//console.log(stepsArray[stepsArrayKeys[currentStep]]);
	}

	//console.log(Math.floor(currentMeasure));
	if(stepsArrayKeys.hasOwnProperty(currentStep)){
		if(currentMeasure > stepsArray[stepsArrayKeys[currentStep]].margin_by_excess)
			stepsArray[stepsArrayKeys[currentStep]].is_playable = false;

		if(currentMeasure > stepsArray[stepsArrayKeys[currentStep]].margin_by_excess && !stepsArray[stepsArrayKeys[currentStep]].is_playable){
			currentStep++;
			console.log("NO ACTION");
			//console.log("-----------");
		}
	}

	//--------------------------------------------------
	//STORE CURRENT STATE OF KEYS FOR THE NEXT ITERATION
	//--------------------------------------------------
	keyStatePrevious = arrowKeys;
}