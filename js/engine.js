/*
 *	This file is part of Dance-o-Dreamers under a
 *	Yet-to-be-decided license
 *	Created by Juan A. "stage7" Martínez of Genshiken
 *
 *	This file is part of BeRGeN - Beat and Rhythm Game Engine under a
 *	Yet-to-be-decided license
 *	Created by Juan A. "stage7" Martínez of Genshiken
 */

function Bergen(songId){
	//----
	//KEYS
	//----
	this.keyStatePrevious = {};
	this.countKeyStatePrevious = 0;

	this.keyLeft = false;
	this.keyUp = false;
	this.keyRight = false;
	this.keyDown = false;

	this.arrowKeys = [false, false, false, false];
	this.countArrowKeys = 0;

	this.ARROW_LEFT = 0;
	this.ARROW_UP = 1;
	this.ARROW_DOWN = 2;
	this.ARROW_RIGHT = 3;

	//Only compare steps that are set to true, set to false those that are pressed when a new note is in play
	this.canPlay = [true, true, true, true];

	//----
	//TIME
	//----
	this.start;

	//-----------------
	//SOME USEFUL STUFF
	//-----------------
	this.playableSteps;
	this.playableStepsArray = new Array();
	this.playableStepsCount = 0;
	this.noteError = false;
	this.currentRightSteps = 0;
	this.fakeSteps = false;
	this.marginToAdd;
	this.marginPoints;
	this.currentMeasure = 0;
	this.currentTime = 0;
	this.isGameOver = false; //stop playing if it is set to true;
	this.currentMeasureInt = null;

	//-----------------
	//ANIMATION CONTROL
	//-----------------
	this.drawAnimations = drawAnimations;
	this.removeAnimation = removeAnimation;

	//-----
	//SCORE
	//-----
	this.score; //points, combo, life, perfect, awesome, great, ok, bad, miss
	this.perfectScore = 0; //the best score a player could get in a song meaning he/she would nail every single note to the beat

	//-----
	//VIDEO
	//-----
	this.videoTag = document.getElementById("video");

	//-----
	//SONGS
	//-----
	this.songId = songId;
	this.song;
	this.songQueue;
	this.songPlay;
	this.errorMargin = 0.5; //maximum threshold in bpm by default/exceed to successfully play a step
	this.stepsArray; //basic step data: number of steps, whether it is playable or not, playability range
	this.stepsArrayKeys; //stores the measures on which every song step is triggered
	this.currentStep; //step number (not measure) to be played

	loadSongs();

	this.startGame = function(){
		//TODO: Change to load proper song
		this.song = JSON.parse(songs[songId]);
		//setTimeout(function(){console.log(songs);},4000);
		this.start = new Date();

		//Initialize some song stuff: object of successful steps, step error margin, etc.
		//Format of stepsArray object: {step_number: [steps, is_playable, margin_by_default, margin_by_excess]}
		//	float	step_number: equals measure defined in song.js
		//	int		steps: number of steps needed to complete this step, equals length of second item in each song item
		//	bool	is_playable: defines if this note can still be played or otherwise was missed, defaults to true
		//	float	margin_by_default: the amount of measures a step can be played before the actual step happens
		//	float	margin_by_excess: the amount of measures a step can be played after the actual step happens
		this.stepsArray = {};
		this.stepsArrayKeys = [];
		for(var i=0; i<this.song.song.length; i++){
			if(i==0){
				this.marginByDefault = this.song.song[i][0] - this.errorMargin;
			}else{
				this.marginByDefault = this.song.song[i][0] - Math.min(this.errorMargin, (this.song.song[i][0]-this.song.song[i-1][0])/2);
			}
			if(i==this.song.song.length-1){
				this.marginByExcess = this.song.song[i][0] + this.errorMargin;
			}else{
				this.marginByExcess = this.song.song[i][0] + Math.min(this.errorMargin, (this.song.song[i+1][0]-this.song.song[i][0])/2);
			}
			this.stepsArray[this.song.song[i][0]] = {steps:this.song.song[i][1].length, is_playable:true, margin_by_default:this.marginByDefault, margin_by_excess:this.marginByExcess};
			this.stepsArrayKeys.push(this.song.song[i][0]);
		}

		this.currentStep = 0;
		this.score = {
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
		this.isGameOver = false;

		//Calculate the perfect score for this song
		for(var i=0; i<this.song.song.length; i++){
			this.perfectScore += this.errorMargin * (i + 1) * this.song.difficulty * 2000;
		}

		this.videoTag.src = "./songs/" + this.songId + "/" + this.song.video;
		//loadAudio("memories", this.song.audio);
		this.songQueue = new createjs.LoadQueue();
		this.songQueue.installPlugin(createjs.Sound);
		var _this = this;
		//this.songQueue.addEventListener("complete", function(){_this.postLoadSong(_this);});
		//this.songQueue.addEventListener("complete", function(){return _this;});
		this.songQueue.addEventListener("complete", function(ev){_this.returnThis(_this);});
		this.songQueue.loadFile({id:"songFile", src:'./songs/' + this.songId + '/' + this.song.audio});

		// videoTag.addEventListener('play', function(){
		// 	drawVideo(this, context, canvasWidth, canvasHeight);
		// },false);
		//videoTag.play();
	}

	this.returnThis = function(_this) {
		return _this;
	}

	this.postLoadSong = function(_this) {
		_this.timer = new Tock({
			interval: 16.6666
		});
		
		// Create two sources and play them both together.
		// source = audioContext.createBufferSource();
		// source.buffer = bufferList[0];
		// source.connect(audioContext.destination);
		// source.start(song.delay/1000, song.timeAdjustment/1000);
		_this.songPlay = null;
		_this.songPlay = createjs.Sound.play("songFile", {delay: _this.song.delay, offset: _this.song.timeAdjustment});

		//console.log(stepsArray);
		//console.log(stepsArrayKeys);

		_this.timer.start();
		_this.videoTag.play();
		_this.videoTag.volume = 0;
		_this.gameLoop(_this.song);
	}

	this.drawVideo = function(videoTag, context, canvasWidth, canvasHeight){
		if(videoTag.paused || videoTag.ended)
			return false;
		//context.drawImage(videoTag, 0, 0, canvasWidth, canvasHeight);
		//context.drawImage(videoTag, 0, 0, 160, 90);
	}

	this.gameLoop = function(song) {
		var _this = this;
		requestAnimationFrame(function(){
			_this.gameLoop(song);
		});
		//context.fillStyle = "#EEEEEE";
		//context.fillRect(0, 0, canvas.width, canvas.height);
		context.clearRect(0, 0, canvas.width, canvas.height);
		this.testKeys();

		currentTime = this.timer.lap();
		this.drawSong(song, currentTime);
		drawAnimations();

		// setTimeout(function(){
		// 	gameLoop(song);
		// }, 10);
	}

	this.testKeys = function() {
		/* Keys down */
		if (keyState[37] || keyState[65]){ // left, 'a'
			keyLeft = true;
			//context.drawImage(img[0],480+32,80,96,96);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),512,128,128,480+16,80,128,128);
		}
		if (keyState[38] || keyState[87]){ // up, 'w'
			//console.log("up");
			keyUp = true;
			//context.drawImage(img[1],480+192,80,96,96);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),640,128,128,480+176,80,128,128);
		}
		if (keyState[39] || keyState[68]){ // right, 'd'
			//console.log("right");
			keyRight = true;
			//context.drawImage(img[3],480+512,80,96,96);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),768,128,128,480+496,80,128,128);
		}
		if (keyState[40] || keyState[83]){ // down, 's'
			//console.log("down");
			keyDown = true;
			//context.drawImage(img[2],480+352,80,96,96);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),896,128,128,480+336,80,128,128);
		}

		/* Keys up */
		if (!keyState[37] && !keyState[65]){ // left, 'a'
			keyLeft = false;
			//context.drawImage(img[0],480+16,64);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),0,128,128,480+16,80,128,128);
		}
		if (!keyState[38] && !keyState[87]){ // up, 'w'
			keyUp = false;
			//context.drawImage(img[1],480+176,64);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),128,128,128,480+176,80,128,128);
		}
		if (!keyState[39] && !keyState[68]){ // right, 'd'
			keyRight = false;
			//context.drawImage(img[3],480+496,64);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),256,128,128,480+496,80,128,128);
		}
		if (!keyState[40] && !keyState[83]){ // down, 's'
			keyDown = false;
			//context.drawImage(img[2],480+336,64);
			context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),384,128,128,480+336,80,128,128);
		} 
	}

	this.drawSong = function(song, time) {
		//drawVideo(videoTag, context, canvasWidth, canvasHeight);
		this.currentMeasure = Math.round((song.bpm/60)*((time)/1000)*10000) / 10000;
		// if(currentMeasureInt != Math.floor(currentMeasure)){
		// 	currentMeasureInt = Math.floor(currentMeasure);
		// 	createjs.Sound.play("metronome");
		// }
		//console.log(currentStep);
		//if(stepsArrayKeys.hasOwnProperty(currentStep))
		//	console.log(stepsArray[stepsArrayKeys[currentStep]].margin_by_excess + " -- " + currentMeasure);

		//---------
		//INTERFACE
		//---------
		context.fillStyle = "rgba(255, 255, 255, .5)";
		roundRect(context, 480, 16, 640, 904, 20, true, false);
		this.drawLife();

		//--------------
		//PAINT THE SONG
		//--------------
		if(!this.isGameOver){
			context.save();
			context.rect(480, 16, 640, 904);
			context.clip();
			for(var i=0; i<song.song.length; i++){
				for(var noteSteps=0; noteSteps<song.song[i][1].length; noteSteps++){
					//console.log(song.song[i][1][noteSteps]);
					this.yPos = song.song[i][0]*(96+32*song.difficulty)-((96+32*song.difficulty)*this.currentMeasure)+64;
					if(this.yPos > -128 && this.yPos < 1088 && this.stepsArray[song.song[i][0]].is_playable){
						context.drawImage(assets['arrows'],128*(Math.floor(this.currentMeasure)%4),1024+song.song[i][1][noteSteps]*128,128,128,480+16+song.song[i][1][noteSteps]*160,this.yPos,128,128);
					}
				}
			}

			context.restore();

			//----------
			//CHECK KEYS
			//----------
			//console.log(keyState);
			if(song.song.hasOwnProperty(this.currentStep)){
				this.noteError = false;
				this.currentRightSteps = 0;
				this.playableSteps = song.song[this.currentStep][1];
				this.playableStepsCount = 0;
				this.playableStepsArray.length = 0;
				for(var i=0; i<4; i++){
					if(this.playableSteps.indexOf(i) > -1){
						this.playableStepsArray.push(true);
						this.playableStepsCount++;
					}
					else
						this.playableStepsArray.push(false);
				}
				this.arrowKeys = [
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
					this.currentMeasure >= this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_default &&
					this.currentMeasure <= this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_excess &&
					this.stepsArray[this.stepsArrayKeys[this.currentStep]].is_playable
				){
					this.fakeSteps = false;
					//Compare canPlay's true items with pressed steps and valid note steps
					for(var i=0; i<4; i++){
						//If the player releases a step that is marked as fake, mark it as playable
						if(this.canPlay[i] == false && this.arrowKeys[i] == false){
							this.canPlay[i] = true;
						}

						if(this.noteError == false && this.canPlay[i] == true){
							if(this.arrowKeys[i] != this.playableStepsArray[i] && this.playableStepsArray[i] == false)
								this.noteError = true;
							else if(this.arrowKeys[i] == true && this.playableStepsArray[i] == true)
								this.currentRightSteps++;
						}
						//If the player has an unplayable step pressed, the note cannot be held as valid
						if(this.noteError == false && this.canPlay[i] == false && this.arrowKeys[i] == true)
							this.fakeSteps = true;
					}

					//------------------------------------------------------------
					//THE NOTE IS PLAYABLE AND ALL THE STEPS ARE RIGHT. WELL DONE!
					//------------------------------------------------------------
					if(this.playableStepsArray.equals(this.arrowKeys) && this.fakeSteps == false && this.noteError == false){
						//console.log("OK");
						//TODO: Give some points according to error margin
						this.marginToAdd = Math.min(this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_excess - this.currentMeasure, this.errorMargin);
						this.marginPoints = Math.abs(this.stepsArrayKeys[this.currentStep] - this.currentMeasure);
						//console.log(marginPoints);
						//-----------------
						//SCORE CALCULATION
						//-----------------
						//TODO: life calculation
						if(this.marginPoints < this.errorMargin/10){
							this.score.perfect++;
							this.score.combo++;
							this.score.points = this.score.points + Math.round((this.errorMargin - this.marginPoints) * (this.score.combo + 1) * song.difficulty * 2000);
							removeAnimation("drawRating");
							animations.push(["drawRating", [time, 'perfect']]);
							//this.score.life
						}else if(this.marginPoints < this.errorMargin/7.5){
							this.score.awesome++;
							this.score.combo++;
							this.score.points = this.score.points + Math.round((this.errorMargin - this.marginPoints) * (this.score.combo + 1) * song.difficulty * 1750);
							removeAnimation("drawRating");
							animations.push(["drawRating", [time, 'awesome']]);
							//this.score.life
						}else if(this.marginPoints < this.errorMargin/4){
							this.score.great++;
							this.score.combo++;
							this.score.points = this.score.points + Math.round((this.errorMargin - this.marginPoints) * (this.score.combo + 1) * song.difficulty * 1500);
							removeAnimation("drawRating");
							animations.push(["drawRating", [time, 'great']]);
							//this.score.life
						}else if(this.marginPoints < this.errorMargin/1.5){
							this.score.ok++;
							this.score.combo++;
							this.score.points = this.score.points + Math.round((this.errorMargin - this.marginPoints) * (this.score.combo + 1) * song.difficulty);
							removeAnimation("drawRating");
							animations.push(["drawRating", [time, 'ok']]);
							//this.score.life
						}else if(this.marginPoints < this.errorMargin){
							this.score.bad++;
							this.score.combo++;
							this.score.points = this.score.points + Math.round((this.errorMargin - this.marginPoints) * (this.score.combo + 1) * song.difficulty * 500);
							removeAnimation("drawRating");
							animations.push(["drawRating", [time, 'bad']]);
							//this.score.life
						}
						this.score.life = Math.min(100, this.score.life + (1 / song.difficulty) * (this.errorMargin - this.marginPoints) * 10);
						if(this.stepsArray.hasOwnProperty(this.currentStep+1)){
							this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_default = Math.max(this.stepsArray[this.stepsArrayKeys[this.currentStep]] - this.marginToAdd, this.stepsArray[this.stepsArrayKeys[this.currentStep]] - this.errorMargin);
						}
						//Set canPlay according to pressed steps
						for(var i=0; i<4; i++)
							this.canPlay[i] = !this.arrowKeys[i];
						this.stepsArray[this.stepsArrayKeys[this.currentStep]].is_playable = false;
						this.currentStep++;
						//console.log(score);
						//console.log("-----------");
					}

					if(this.score.life <= 0 && this.isGameOver == false){
						this.isGameOver = true;
						animations.push(["drawGameOver", [time]]);
						this.songPlay.paused = true;
						createjs.Sound.removeSound("songFile");
						createjs.Sound.play("vinylScratch");
						this.videoTag.pause();
					}

					//------------------------------------
					//OOPS, MISTAKE MADE, NEXT NOTE ANYWAY
					//------------------------------------
					if(this.noteError == true){
						//console.log("ERROR");
						this.marginToAdd = Math.min(this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_excess - this.currentMeasure, this.errorMargin);
						//-----------------
						//SCORE CALCULATION
						//-----------------
						//TODO: life calculation
						this.score.miss++;
						this.score.life = Math.max(0, this.score.life - Math.sqrt(this.score.combo) - this.song.difficulty * 1.5);
						removeAnimation("drawRating");
						animations.push(["drawRating", [time, 'miss']]);
						this.score.combo = 0;
						if(this.stepsArray.hasOwnProperty(this.currentStep+1)){
							this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_default = Math.max(this.stepsArray[this.stepsArrayKeys[this.currentStep]] - this.marginToAdd, this.stepsArray[this.stepsArrayKeys[this.currentStep]] - this.errorMargin);
						}
						//Set canPlay according to pressed steps
						for(var i=0; i<4; i++)
							this.canPlay[i] = !this.arrowKeys[i];
						this.stepsArray[this.stepsArrayKeys[this.currentStep]].is_playable = false;
						this.currentStep++;
						//console.log(score);
						//console.log("-----------");
					}
				}else{
					for(var i=0; i<4; i++){
						if(this.arrowKeys[i] == true){
							this.fakeSteps = true;
							break;
						}
					}
				}

				//console.log(stepsArray[stepsArrayKeys[currentStep]]);
			}

			//console.log(Math.floor(currentMeasure));
			if(this.stepsArrayKeys.hasOwnProperty(this.currentStep)){
				if(this.currentMeasure > this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_excess)
					this.stepsArray[this.stepsArrayKeys[this.currentStep]].is_playable = false;

				if(this.currentMeasure > this.stepsArray[this.stepsArrayKeys[this.currentStep]].margin_by_excess && !this.stepsArray[this.stepsArrayKeys[this.currentStep]].is_playable){
					//-----------------
					//SCORE CALCULATION
					//-----------------
					//TODO: life calculation
					this.score.miss++;
					this.score.life = Math.max(0, this.score.life - Math.sqrt(this.score.combo) - song.difficulty * 1.5);
					removeAnimation("drawRating");
					animations.push(["drawRating", [time, 'miss']]);
					this.score.combo = 0;
					this.currentStep++;
					//console.log(score);
					//console.log("NO ACTION");
					//console.log("-----------");
				}
			}	
		}

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

		this.drawScore();
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.font = "60pt nukamiso";
		context.strokeText(window.padLeftZeros(this.score.points, 9), 1403.5, 77.5);
		context.fillText(window.padLeftZeros(this.score.points, 9), 1403.5, 77.5);
		context.strokeText(this.padLife(this.score.life) + "%", 196.5, 77.5);
		context.fillText(this.padLife(this.score.life) + "%", 196.5, 77.5);
		context.textAlign = "start";

		this.drawCombo();
	//drawFinalScore();
		if(this.songPlay.playState == createjs.Sound.PLAY_FINISHED){
			this.drawFinalScore();
		}
	}

	this.padLife = function(score){
		return parseFloat(Math.round(score*10)/10).toFixed(1);
	}

	this.drawLife = function(){
		context.drawImage(assets['holderLife'], 0, 0);
		context.drawImage(assets['lifeMeter'], 0, 0, this.score.life/100*445, 155, 0, 0, this.score.life/100*445, 155);
	}

	this.drawScore = function(){
		context.drawImage(assets['holderPoints'], 1155, 0);
		context.drawImage(
			assets['scoreMeter'],
			Math.round(Math.max(0,445-(this.score.points/(this.perfectScore*0.75)*445))),
			0,
			Math.round(Math.max(0,this.score.points/(this.perfectScore*0.75)*445)),
			155,
			Math.round(1600-(Math.min(445,(this.score.points/(this.perfectScore*0.75)*445)))),
			0,
			Math.round(Math.min(445,this.score.points/(this.perfectScore*0.75)*445)),
			155);

		//DEBUG
		// context.fillText("sx:    " + Math.max(0,445-(score.points/(perfectScore*0.75)*445)), 1200, 375);
		// context.fillText("swidth:" + Math.max(0,score.points/(perfectScore*0.75)*445), 1200, 400);
		// context.fillText("x:     " + (1600-(Math.min(445,(score.points/(perfectScore*0.75)*445)))), 1200, 425);
		// context.fillText("width: " + Math.min(445,score.points/(perfectScore*0.75)*445), 1200, 450);
	}

	this.drawCombo = function(){
		if(this.score.combo > 0){
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
			context.strokeText(this.score.combo, 240, canvasHeight/2);
			context.fillText(this.score.combo, 240, canvasHeight/2);

			context.shadowOffsetX = 5;
			context.shadowOffsetY = -5;
			context.font = "30pt swiss";
			context.fillStyle = "white";
			context.strokeText("COMBO", 300, canvasHeight/2 + 60);
			context.fillText("COMBO", 300, canvasHeight/2 + 60);
			context.restore();
		}
	}

	this.drawFinalScore = function(){
		context.save();
		context.fillStyle = "rgba(0, 0, 0, .5)";
		roundRect(context, 400, 100, 800, 700, 20, true, false);
		context.lineWidth = 3;
		context.textAlign = "right";
		context.strokeStyle = "black";
		context.fillStyle = "white";
		context.font = "40pt nukamiso";
		context.strokeText(window.padLeftZeros(this.score.perfect, 4), 750, 300);
		context.fillText(window.padLeftZeros(this.score.perfect, 4), 750, 300);
		context.strokeText(window.padLeftZeros(this.score.awesome, 4), 750, 375);
		context.fillText(window.padLeftZeros(this.score.awesome, 4), 750, 375);
		context.strokeText(window.padLeftZeros(this.score.great, 4), 750, 450);
		context.fillText(window.padLeftZeros(this.score.great, 4), 750, 450);

		context.strokeText(window.padLeftZeros(this.score.ok, 4), 1100, 300);
		context.fillText(window.padLeftZeros(this.score.ok, 4), 1100, 300);
		context.strokeText(window.padLeftZeros(this.score.bad, 4), 1100, 375);
		context.fillText(window.padLeftZeros(this.score.bad, 4), 1100, 375);
		context.strokeText(window.padLeftZeros(this.score.miss, 4), 1100, 450);
		context.fillText(window.padLeftZeros(this.score.miss, 4), 1100, 450);
		context.restore();
	}

	this.drawRating = function(time, asset){
		var scale = 1;
		var deltaTime = currentTime - time;
		if(deltaTime <= 500){
			scale = (1-(deltaTime/500))*0.5+1;
		}
		context.drawImage(
			assets[asset],
			0,
			0,
			assets[asset].width,
			assets[asset].height,
			600 - ((assets[asset].width / 2) * scale - (assets[asset].width / 2)),
			405 - ((assets[asset].height / 2) * scale - (assets[asset].height / 2)),
			assets[asset].width * scale,
			assets[asset].height * scale);
		if(deltaTime > 1000){
			this.removeAnimation(this, "drawRating");
		}
	}

	this.drawGameOver = function(time){
		var deltaTime = currentTime - time;
		this.removeAnimation(this, "drawRating");
		if(deltaTime <= 2000){
			context.fillStyle = "rgba(0, 0, 0, " + ((deltaTime) / 4000) + ")";
			context.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
		}else{
			context.fillStyle = "rgba(0, 0, 0, 0.5)";
			context.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
			if(deltaTime <= 4000){
					context.fillStyle = "rgba(255, 255, 255, " + ((deltaTime - 2000) / 2000) + ")";
					context.strokeStyle = "rgba(0, 0, 0, " + ((deltaTime - 2000) / 2000) + ")";
			}else{
				context.fillStyle = "rgba(255, 255, 255, 1)";
				context.strokeStyle = "rgba(0, 0, 0, 1)";
			}
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.font = "60pt nukamiso";
			context.strokeText(languages["en"].gameOver, canvas.width/2, canvas.height/2);
			context.fillText(languages["en"].gameOver, canvas.width/2, canvas.height/2);
			context.textAlign = "start";
		}
	}
}