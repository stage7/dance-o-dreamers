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
var fakeSteps = false;
var marginToAdd;
var marginPoints;
var currentMeasure = 0;
var currentTime = 0;

//-----------------
//ANIMATION CONTROL
//-----------------

//-----
//SCORE
//-----
var score; //points, combo, life, perfect, awesome, great, ok, bad, miss
var perfectScore = 0; //the best score a player could get in a song meaning he/she would nail every single note to the beat

//-----
//VIDEO
//-----
var videoTag = document.getElementById("video");

//-----
//SONGS
//-----
var song;
var errorMargin = 0.5; //maximum threshold in bpm by default/exceed to successfully play a step
var stepsArray; //basic step data: number of steps, whether it is playable or not, playability range
var stepsArrayKeys; //stores the measures on which every song step is triggered
var currentStep; //step number (not measure) to be played
load_songs();

function startGame(){
	//TODO: Change to load proper song
	song = JSON.parse(songs.memories);
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
	score = {
		points: 0,
		combo: 0,
		life: 50,
		perfect: 0,
		awesome: 0,
		great: 0,
		ok: 0,
		bad: 0,
		miss: 0
	};

	//Calculate the perfect score for this song
	for(var i=0; i<song.song.length; i++){
		perfectScore += errorMargin * (i + 1) * song.difficulty * 2000;
	}

	videoTag.src = "./songs/memories/" + song.video;
	
	loadAudio("memories", song.audio);

	// videoTag.addEventListener('play', function(){
	// 	drawVideo(this, context, canvasWidth, canvasHeight);
	// },false);
	//videoTag.play();

}

function postLoadSong(bufferList) {
	timer = new Tock({
		interval: 16.6666,
		callback: function(){gameLoop(song);}
	});
	
	// Create two sources and play them both together.
	source = audioContext.createBufferSource();
	source.buffer = bufferList[0];
	source.connect(audioContext.destination);
	source.start(song.delay/1000, song.timeAdjustment/1000);

	//console.log(stepsArray);
	//console.log(stepsArrayKeys);

	timer.start();
	videoTag.play();
	videoTag.volume = 0;
	//gameLoop(song);
}

function drawVideo(videoTag, context, canvasWidth, canvasHeight){
	if(videoTag.paused || videoTag.ended)
		return false;
	//context.drawImage(videoTag, 0, 0, canvasWidth, canvasHeight);
	//context.drawImage(videoTag, 0, 0, 160, 90);
}

function gameLoop(song) {
	//context.fillStyle = "#EEEEEE";
	//context.fillRect(0, 0, canvas.width, canvas.height);
	context.clearRect(0, 0, canvas.width, canvas.height);
	testKeys();

	currentTime = timer.lap();
	drawSong(song, currentTime);
	drawAnimations();

	// setTimeout(function(){
	// 	gameLoop(song);
	// }, 10);
}

function testKeys() {
	/* Keys down */
	if (keyState[37] || keyState[65]){ // left, 'a'
		keyLeft = true;
		//context.drawImage(img[0],480+32,80,96,96);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),512,128,128,480+16,80,128,128);
	}
	if (keyState[38] || keyState[87]){ // up, 'w'
		//console.log("up");
		keyUp = true;
		//context.drawImage(img[1],480+192,80,96,96);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),640,128,128,480+176,80,128,128);
	}
	if (keyState[39] || keyState[68]){ // right, 'd'
		//console.log("right");
		keyRight = true;
		//context.drawImage(img[3],480+512,80,96,96);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),768,128,128,480+496,80,128,128);
	}
	if (keyState[40] || keyState[83]){ // down, 's'
		//console.log("down");
		keyDown = true;
		//context.drawImage(img[2],480+352,80,96,96);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),896,128,128,480+336,80,128,128);
	}

	/* Keys up */
	if (!keyState[37] && !keyState[65]){ // left, 'a'
		keyLeft = false;
		//context.drawImage(img[0],480+16,64);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),0,128,128,480+16,80,128,128);
	}
	if (!keyState[38] && !keyState[87]){ // up, 'w'
		keyUp = false;
		//context.drawImage(img[1],480+176,64);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),128,128,128,480+176,80,128,128);
	}
	if (!keyState[39] && !keyState[68]){ // right, 'd'
		keyRight = false;
		//context.drawImage(img[3],480+496,64);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),256,128,128,480+496,80,128,128);
	}
	if (!keyState[40] && !keyState[83]){ // down, 's'
		keyDown = false;
		//context.drawImage(img[2],480+336,64);
		context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),384,128,128,480+336,80,128,128);
	} 
}

function drawSong(song, time) {
	//drawVideo(videoTag, context, canvasWidth, canvasHeight);
	currentMeasure = Math.round((song.bpm/60)*(time/1000)*10000) / 10000;
	//console.log(currentStep);
	//if(stepsArrayKeys.hasOwnProperty(currentStep))
	//	console.log(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess + " -- " + currentMeasure);

	//---------
	//INTERFACE
	//---------
	context.fillStyle = "rgba(255, 255, 255, .5)";
	roundRect(context, 480, 16, 640, 904, 20, true, false);
	drawLife();

	context.save();
	context.rect(480, 16, 640, 904);
	context.clip();
	//--------------
	//PAINT THE SONG
	//--------------
	for(var i=0; i<song.song.length; i++){
		for(var noteSteps=0; noteSteps<song.song[i][1].length; noteSteps++){
			//console.log(song.song[i][1][noteSteps]);
			var yPos = song.song[i][0]*(96+32*song.difficulty)-((96+32*song.difficulty)*currentMeasure)+64;
			if(yPos > -128 && yPos < 1088 && stepsArray[song.song[i][0]].is_playable){
				context.drawImage(assets['arrows'],128*(Math.floor(currentMeasure)%4),1024+song.song[i][1][noteSteps]*128,128,128,480+16+song.song[i][1][noteSteps]*160,yPos,128,128);
			}
		}
	}

	context.restore();

	context.lineWidth = 3;
	context.textAlign = "center";
	context.strokeStyle = "black";
	context.fillStyle = "white";
	context.font = "40pt nukamiso";
	context.strokeText(song.title, canvasWidth/2, 860);
	context.fillText(song.title, canvasWidth/2, 860);
	context.font = "20pt nukamiso";
	context.strokeText(song.artist, canvasWidth/2, 800);
	context.fillText(song.artist, canvasWidth/2, 800);
	context.textAlign = "start";

	//----------
	//CHECK KEYS
	//----------
	//console.log(keyState);
	if(song.song.hasOwnProperty(currentStep)){
		noteError = false;
		currentRightSteps = 0;
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
			fakeSteps = false;
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
					fakeSteps = true;
			}

			//------------------------------------------------------------
			//THE NOTE IS PLAYABLE AND ALL THE STEPS ARE RIGHT. WELL DONE!
			//------------------------------------------------------------
			if(playableStepsArray.equals(arrowKeys) && fakeSteps == false && noteError == false){
				//console.log("OK");
				//TODO: Give some points according to error margin
				marginToAdd = Math.min(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess - currentMeasure, errorMargin);
				marginPoints = Math.abs(stepsArrayKeys[currentStep] - currentMeasure);
				//console.log(marginPoints);
				//-----------------
				//SCORE CALCULATION
				//-----------------
				//TODO: life calculation
				if(marginPoints < errorMargin/10){
					score.perfect++;
					score.combo++;
					score.points = score.points + Math.round((errorMargin - marginPoints) * (score.combo + 1) * song.difficulty * 2000);
					animations.push(["drawRating", [time, 'perfect']]);
					//score.life
				}else if(marginPoints < errorMargin/7.5){
					score.awesome++;
					score.combo++;
					score.points = score.points + Math.round((errorMargin - marginPoints) * (score.combo + 1) * song.difficulty * 1750);
					animations.push(["drawRating", [time, 'awesome']]);
					//score.life
				}else if(marginPoints < errorMargin/4){
					score.great++;
					score.combo++;
					score.points = score.points + Math.round((errorMargin - marginPoints) * (score.combo + 1) * song.difficulty * 1500);
					animations.push(["drawRating", [time, 'great']]);
					//score.life
				}else if(marginPoints < errorMargin/1.5){
					score.ok++;
					score.combo++;
					score.points = score.points + Math.round((errorMargin - marginPoints) * (score.combo + 1) * song.difficulty);
					animations.push(["drawRating", [time, 'ok']]);
					//score.life
				}else if(marginPoints < errorMargin){
					score.bad++;
					score.combo++;
					score.points = score.points + Math.round((errorMargin - marginPoints) * (score.combo + 1) * song.difficulty * 500);
					animations.push(["drawRating", [time, 'bad']]);
					//score.life
				}
				score.life = Math.min(100, score.life + (1 / song.difficulty) * (errorMargin - marginPoints) * 10);
				if(stepsArray.hasOwnProperty(currentStep+1)){
					stepsArray[stepsArrayKeys[currentStep]].margin_by_default = Math.max(stepsArray[stepsArrayKeys[currentStep]] - marginToAdd, stepsArray[stepsArrayKeys[currentStep]] - errorMargin);
				}
				//Set canPlay according to pressed steps
				for(var i=0; i<4; i++)
					canPlay[i] = !arrowKeys[i];
				stepsArray[stepsArrayKeys[currentStep]].is_playable = false;
				currentStep++;
				//console.log(score);
				//console.log("-----------");
			}

			//------------------------------------
			//OOPS, MISTAKE MADE, NEXT NOTE ANYWAY
			//------------------------------------
			if(noteError == true){
				//console.log("ERROR");
				marginToAdd = Math.min(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess - currentMeasure, errorMargin);
				//-----------------
				//SCORE CALCULATION
				//-----------------
				//TODO: life calculation
				score.miss++;
				score.life = Math.max(0, score.life - Math.sqrt(score.combo) - song.difficulty * 1.5);
				animations.push(["drawRating", [time, 'miss']]);
				score.combo = 0;
				if(stepsArray.hasOwnProperty(currentStep+1)){
					stepsArray[stepsArrayKeys[currentStep]].margin_by_default = Math.max(stepsArray[stepsArrayKeys[currentStep]] - marginToAdd, stepsArray[stepsArrayKeys[currentStep]] - errorMargin);
				}
				//Set canPlay according to pressed steps
				for(var i=0; i<4; i++)
					canPlay[i] = !arrowKeys[i];
				stepsArray[stepsArrayKeys[currentStep]].is_playable = false;
				currentStep++;
				//console.log(score);
				//console.log("-----------");
			}
		}else{
			for(var i=0; i<4; i++){
				if(arrowKeys[i] == true){
					fakeSteps = true;
					break;
				}
			}
		}

		//console.log(stepsArray[stepsArrayKeys[currentStep]]);
	}

	//console.log(Math.floor(currentMeasure));
	if(stepsArrayKeys.hasOwnProperty(currentStep)){
		if(currentMeasure > stepsArray[stepsArrayKeys[currentStep]].margin_by_excess)
			stepsArray[stepsArrayKeys[currentStep]].is_playable = false;

		if(currentMeasure > stepsArray[stepsArrayKeys[currentStep]].margin_by_excess && !stepsArray[stepsArrayKeys[currentStep]].is_playable){
			//-----------------
			//SCORE CALCULATION
			//-----------------
			//TODO: life calculation
			score.miss++;
			score.life = Math.max(0, score.life - Math.sqrt(score.combo) - song.difficulty * 1.5);
			animations.push(["drawRating", [time, 'miss']]);
			score.combo = 0;
			currentStep++;
			//console.log(score);
			//console.log("NO ACTION");
			//console.log("-----------");
		}
	}

	drawScore();
	context.textBaseline = "middle";
	context.textAlign = "center";
	context.fillStyle = "white";
	context.font = "60pt nukamiso";
	context.strokeText(padPoints(score.points), 1403.5, 77.5);
	context.fillText(padPoints(score.points), 1403.5, 77.5);
	context.strokeText(padLife(score.life) + "%", 196.5, 77.5);
	context.fillText(padLife(score.life) + "%", 196.5, 77.5);
	context.textAlign = "start";

	drawCombo();
}

function padPoints(score){
	var score = "000000000" + score;
	return score.substr(score.length-9);
}

function padLife(score){
	return parseFloat(Math.round(score*10)/10).toFixed(1);
}

function drawLife(){
	context.drawImage(assets['holderLife'], 0, 0);
	context.drawImage(assets['lifeMeter'], 0, 0, score.life/100*445, 155, 0, 0, score.life/100*445, 155);
}

function drawScore(){
	context.drawImage(assets['holderPoints'], 1155, 0);
	context.drawImage(
		assets['scoreMeter'],
		Math.round(Math.max(0,445-(score.points/(perfectScore*0.75)*445))),
		0,
		Math.round(Math.max(0,score.points/(perfectScore*0.75)*445)),
		155,
		Math.round(1600-(Math.min(445,(score.points/(perfectScore*0.75)*445)))),
		0,
		Math.round(Math.min(445,score.points/(perfectScore*0.75)*445)),
		155);

	//DEBUG
	// context.fillText("sx:    " + Math.max(0,445-(score.points/(perfectScore*0.75)*445)), 1200, 375);
	// context.fillText("swidth:" + Math.max(0,score.points/(perfectScore*0.75)*445), 1200, 400);
	// context.fillText("x:     " + (1600-(Math.min(445,(score.points/(perfectScore*0.75)*445)))), 1200, 425);
	// context.fillText("width: " + Math.min(445,score.points/(perfectScore*0.75)*445), 1200, 450);
}

function drawCombo(){
	if(score.combo > 0){
		context.save();
		context.shadowColor = "black";
		context.shadowOffsetX = 10;
		context.shadowOffsetY = -10;
		context.shadowBlur = 0;
		context.font = "140pt swiss";
		context.lineWidth = 15;
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.strokeStyle = "black";
		context.fillStyle = "red";
		context.strokeText(score.combo, 240, canvasHeight/2);
		context.fillText(score.combo, 240, canvasHeight/2);

		context.shadowOffsetX = 5;
		context.shadowOffsetY = -5;
		context.font = "30pt swiss";
		context.fillStyle = "white";
		context.strokeText("COMBO", 300, canvasHeight/2 + 60);
		context.fillText("COMBO", 300, canvasHeight/2 + 60);
		context.restore();
	}
}