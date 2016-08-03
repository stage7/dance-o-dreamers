/*
 *	This file is part of Dance-o-Dreamers under a
 *	Yet-to-be-decided license
 *	Created by Juan A. "stage7" Martínez of Genshiken
 */

var previews = {};
var itemsPreview = new Array();
var itemsPreviewNames = new Array();
var parsedSongs = [];
var songCount = 0;
var localStorageScore;

createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);

function Menu(){
	this.animations = Array();
	this.previousChosenSong = null;
	this.chosenSong = 0;
	this.indices = Array();

	//--------------------------
	//USEFUL ANIMATION VARIABLES
	//--------------------------
	this.drawAnimations = drawAnimations;
	this.removeAnimation = removeAnimation;
	this.movingSong = false;
	this.movedSongs = 0;

	//-------------------
	//SONG AUDIO PREVIEWS
	//-------------------
	this.previewPlay;
	this.previewQueue;
	this.previewManifests = Array();

	// var previewQueue = new createjs.LoadQueue();
	// previewQueue.installPlugin(createjs.Sound);
	// previewQueue.addEventListener("complete", postLoadPreview);

	//loadSongsMenu();

	this.loadSongsMenu = function() {
		for(var i = 0; i < songList.length; i++){
			require(["./songs/" + songList[i] + "/song"], function(){
				addSongCount();
			});
		}
	}

	this.addSongCount = function(_this) {
		songCount++;
		if(songCount == songList.length){
			for(key in songs){
				parsedSongs.push(JSON.parse(songs[key]));
			}

			for(var i=0; i<songList.length; i++){
				itemsPreview.push("./songs/" + songList[i] + "/preview.png");
				itemsPreviewNames.push(songList[i]);
			}

			loader(
				itemsPreview,
				loadImage,
				function(){
					_this.sortSongs(_this);
					//this.startMenu();
				},
				previews,
				itemsPreviewNames);
		}
	}

	this.songsLoaded = function(_this) {
		for(key in songs){
			parsedSongs.push(JSON.parse(songs[key]));
		}

		for(var i=0; i<songList.length; i++){
			itemsPreview.push("./songs/" + songList[i] + "/preview.png");
			itemsPreviewNames.push(songList[i]);
		}

		loader(
			itemsPreview,
			loadImage,
			function(){
				_this.sortSongs(_this);
				//this.startMenu();
			},
			previews,
			itemsPreviewNames);
	}

	this.sortSongs = function(_this) {
		parsedSongs.sort(function(a,b){
			var titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
			if(a.title < b.title) return -1;
			if(a.title > b.title) return 1;
			return 0;
		});
		//console.log(parsedSongs[0]);
		//console.log(parsedSongs.length);
		
		// timer = new Tock({
		// 	interval: 16.6666,
		// 	callback: function(){startMenu();}
		// });

		currentTime = 0;
		timer = new Tock({
			interval: 16.6666
		});
		timer.start();

		//console.log(parsedSongs)
		this.previewQueue = null;
		this.previewQueue = new createjs.LoadQueue();
		this.previewQueue.installPlugin(createjs.Sound);
		this.previewQueue.addEventListener("complete", function(ev){_this.postLoadPreview(_this);});
		this.previewQueue.addEventListener("fileload", _this.fileComplete);
		this.previewQueue.addEventListener("error", _this.handleFileError);
		for(var i=0; i<parsedSongs.length; i++){
			//previewManifests.push([{id: "previewFile", src: './songs/' + parsedSongs[i].songUniqueName + '/preview.mp3'}]);
			this.previewQueue.loadFile({id: parsedSongs[i].songUniqueName + "Preview", src: './songs/' + parsedSongs[i].songUniqueName + '/preview.mp3', type:createjs.AbstractLoader.SOUND});
		}

		//postLoadPreview();
		localStorageScore = loadLocalStorageScore(parsedSongs[this.chosenSong].songUniqueName);
		this.startMenu();
	}

	this.fileComplete = function(evt) {
		console.log("Event Callback file loaded ", evt);
	}

	this.handleFileError = function(evt) {
		console.log("error ", evt);
		// An error occurred.
	}

	this.postLoadPreview = function(_this) {
		this.previewPlay = null;
		this.previewPlay = createjs.Sound.play(parsedSongs[_this.chosenSong].songUniqueName + "Preview", {loop: -1});
		//console.log(this.previewPlay);
	}

	this.calculateChosenSong = function() {
		if(this.chosenSong < 0){
			this.chosenSong = parsedSongs.length - 1;
		}else if(this.chosenSong > parsedSongs.length - 1){
			this.chosenSong = 0;
		}
	}

	this.startMenu = function(){
		currentTime = timer.lap();

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "blue";
		context.rect(0, 0, 1600, 900);

		//Background preview
		//context.save();
		//context.filter = "blur(2px)";
		context.drawImage(assets['backMenu'], 0, 0, 1600, 900);
		//context.filter = "none";
		//context.restore();
		//END background preview

		// Current song metadata and scores
		context.lineWidth = 3;
		context.textBaseline = "middle";
		context.textAlign = "start";
		context.fillStyle = "white";
		context.font = "40pt nukamiso";
		//console.log(parsedSongs[chosenSong].bpm);
		context.strokeText(parsedSongs[this.chosenSong].bpm + "BPM - " + languages["en"]["difficulty"] + " " + parsedSongs[this.chosenSong].difficulty, 40, 150);
		context.fillText(parsedSongs[this.chosenSong].bpm + "BPM - " + languages["en"]["difficulty"] + " " + parsedSongs[this.chosenSong].difficulty, 40, 150);
		if(localStorageScore){
			for(var i = 0; i < localStorageScore.length; i++){
				context.strokeText(padLeftZeros(localStorageScore[i]["score"], 9) + "   " + localStorageScore[i]["name"], 40, 220+i*50);
				context.fillText(padLeftZeros(localStorageScore[i]["score"], 9) + "   " + localStorageScore[i]["name"], 40, 220+i*50);
				context.rect(318, 200+i*50, 40, 40);
				context.stroke();
				context.drawImage(assets["flag_" + localStorageScore[i]["co"]], 318, 200+i*50, 40, 40);
			}
			for(var i = localStorageScore.length; i < 10; i++){
				context.strokeText("000000000   dance-o-dreamers", 40, 220+i*50);
				context.fillStyle = "gray";
				context.fillText("000000000   dance-o-dreamers", 40, 220+i*50);
			}
		}else{
			for(var i = 0; i < 10; i++){
				context.strokeText("000000000   dance-o-dreamers", 40, 220+i*50);
				context.fillStyle = "gray";
				context.fillText("000000000   dance-o-dreamers", 40, 220+i*50);
			}
		}

		context.save();
		context.drawImage(assets['songChooserFrame'], 810, 0, 790, 900);
		this.clipSongChooserFrame();

		// Calculate song indices
		if(this.previousChosenSong != this.chosenSong){
			this.previousChosenSong = this.chosenSong;
			this.indices = Array();
			var parsedSongsLength = parsedSongs.length;
			for(var i=this.chosenSong-4; i<=this.chosenSong+4; i++){
				if(i < 0)
					this.indices.push((parsedSongsLength - (Math.abs(i)%parsedSongsLength)) % parsedSongsLength);
				else
					this.indices.push(i%parsedSongsLength);
			}
		}

		// Song pictures
		if(this.movingSong == false){
			var clippingY = 150-((300*72/219)/2);
			context.drawImage(previews[parsedSongs[this.indices[1]].songUniqueName], 0, clippingY, 800, 100, 1216, 14, 584, 72); // first song
			context.drawImage(previews[parsedSongs[this.indices[2]].songUniqueName], 0, clippingY, 800, 100, 1116, 114, 584, 72); // before previous song
			context.drawImage(previews[parsedSongs[this.indices[3]].songUniqueName], 0, clippingY, 800, 100, 1016, 214, 584, 72); // previous song
			context.drawImage(previews[parsedSongs[this.indices[4]].songUniqueName], 0, 0, 800, 300, 816, 314, 784, 272); // chosen song
			context.drawImage(previews[parsedSongs[this.indices[5]].songUniqueName], 0, clippingY, 800, 100, 1016, 614, 584, 72); // next song
			context.drawImage(previews[parsedSongs[this.indices[6]].songUniqueName], 0, clippingY, 800, 100, 1116, 714, 584, 72); // after next song
			context.drawImage(previews[parsedSongs[this.indices[7]].songUniqueName], 0, clippingY, 800, 100, 1216, 814, 584, 72); // last song

			// Song data
			context.textBaseline = "top";
			context.lineWidth = 3;
			context.strokeStyle = "black";
			context.fillStyle = "white";
			context.font = "25pt nukamiso";
			context.strokeText(parsedSongs[this.indices[1]].title, 1250, 20, 340);
			context.fillText(parsedSongs[this.indices[1]].title, 1250, 20, 340);
			context.strokeText(parsedSongs[this.indices[2]].title, 1150, 120, 440);
			context.fillText(parsedSongs[this.indices[2]].title, 1150, 120, 440);
			context.strokeText(parsedSongs[this.indices[3]].title, 1050, 220, 540);
			context.fillText(parsedSongs[this.indices[3]].title, 1050, 220, 540);
			context.strokeText(parsedSongs[this.indices[4]].artist, 920, 370, 670);
			context.fillText(parsedSongs[this.indices[4]].artist, 920, 370, 670);
			context.strokeText(parsedSongs[this.indices[5]].title, 1050, 620, 540);
			context.fillText(parsedSongs[this.indices[5]].title, 1050, 620, 540);
			context.strokeText(parsedSongs[this.indices[6]].title, 1150, 720, 440);
			context.fillText(parsedSongs[this.indices[6]].title, 1150, 720, 440);
			context.strokeText(parsedSongs[this.indices[7]].title, 1250, 820, 340);
			context.fillText(parsedSongs[this.indices[7]].title, 1250, 820, 340);
			context.font = "15pt nukamiso";
			context.strokeText(parsedSongs[this.indices[1]].artist, 1250, 55, 340);
			context.fillText(parsedSongs[this.indices[1]].artist, 1250, 55, 340);
			context.strokeText(parsedSongs[this.indices[2]].artist, 1150, 155, 440);
			context.fillText(parsedSongs[this.indices[2]].artist, 1150, 155, 440);
			context.strokeText(parsedSongs[this.indices[3]].artist, 1050, 255, 540);
			context.fillText(parsedSongs[this.indices[3]].artist, 1050, 255, 540);
			context.strokeText(parsedSongs[this.indices[5]].artist, 1050, 655, 540);
			context.fillText(parsedSongs[this.indices[5]].artist, 1050, 655, 540);
			context.strokeText(parsedSongs[this.indices[6]].artist, 1150, 755, 440);
			context.fillText(parsedSongs[this.indices[6]].artist, 1150, 755, 440);
			context.strokeText(parsedSongs[this.indices[7]].artist, 1250, 855, 340);
			context.fillText(parsedSongs[this.indices[7]].artist, 1250, 855, 340);
			context.font = "40pt nukamiso";
			context.strokeText(parsedSongs[this.indices[4]].title, 920, 320, 670);
			context.fillText(parsedSongs[this.indices[4]].title, 920, 320, 670);
		}
		context.restore();
		context.fillStyle = "white";

		var _this = this;
		if (ret = this.testKeysMenu(this)){
			return ret;
		}
		this.drawAnimations(this);
		animationFrame = requestAnimationFrame(function(){
			_this.startMenu();
		});
	}

	this.testKeysMenu = function(_this){
		/* Keys down */
		if (keyState[KEY_LEFT] || keyState[KEY_A]){ // left, 'a'

		}
		if (keyState[KEY_UP] || keyState[KEY_W]){ // up, 'w'
			if(this.movingSong == false){
				this.chosenSong--;
				this.calculateChosenSong();
				//console.log(chosenSong);
				this.movingSong = true;
				this.animations.push(["animChangeSong", [currentTime, previews, this.indices, -1]]);
			}
		}
		if (keyState[KEY_RIGHT] || keyState[KEY_D]){ // right, 'd'

		}
		if (keyState[KEY_DOWN] || keyState[KEY_S]){ // down, 's'
			if(this.movingSong == false){
				this.chosenSong++;
				this.calculateChosenSong();
				//console.log(chosenSong);
				//console.log(indices);
				this.movingSong = true;
				//console.log(previewPlay);
				this.animations.push(["animChangeSong", [currentTime, previews, this.indices, 1]]);
			}
		}

		if (checkKeyReleased(KEY_ENTER)){
			//console.log(parsedSongs[chosenSong].songUniqueName);
			//alert("caller is " + arguments.callee.caller.toString());
			cancelAnimationFrame(animationFrame);
			this.previewPlay.paused = true;
			console.log("checkKeyReleased");
			return 1;
			/*loadScreen();
			var game = new Bergen(parsedSongs[chosenSong].songUniqueName);
			game.startGame();
			//console.log(game);
			setTimeout(function(){game.postLoadSong(game);}, 1500);*/
		}
	}

	this.clipSongChooserFrame = function(){
		context.beginPath();
		context.moveTo(1241, 14);
		context.lineTo(1600, 14);
		context.lineTo(1600, 886);
		context.lineTo(1241, 886);
		context.lineTo(1217, 850);
		context.lineTo(1241, 814);
		context.lineTo(1600, 814);
		context.lineTo(1600, 786);
		context.lineTo(1141, 786);
		context.lineTo(1117, 750);
		context.lineTo(1141, 714);
		context.lineTo(1600, 714);
		context.lineTo(1600, 686);
		context.lineTo(1041, 686);
		context.lineTo(1017, 650);
		context.lineTo(1041, 614);
		context.lineTo(1600, 614);
		context.lineTo(1600, 586);
		context.lineTo(907, 586);
		context.lineTo(817, 450);
		context.lineTo(907, 314);
		context.lineTo(1600, 314);
		context.lineTo(1600, 286);
		context.lineTo(1041, 286);
		context.lineTo(1017, 250);
		context.lineTo(1041, 214);
		context.lineTo(1600, 214);
		context.lineTo(1600, 186);
		context.lineTo(1141, 186);
		context.lineTo(1117, 150);
		context.lineTo(1141, 114);
		context.lineTo(1600, 114);
		context.lineTo(1600, 86);
		context.lineTo(1241, 86);
		context.lineTo(1217, 50);
		context.closePath();

		context.clip();
	}

	this.animChangeSong = function(time, previews, indices, direction){
		var deltaTime = currentTime - time;
		var deltaTimeCalcs = Math.min(500, deltaTime);
		var clippingY = 150-((300*72/219)/2);

		this.previewPlay.volume = 1 - (deltaTimeCalcs/500);
		context.save();
		this.clipSongChooserFrame();

		if(direction == -1){ // up
			context.drawImage(previews[parsedSongs[indices[0]].songUniqueName], 0, clippingY, 800, 100, 1216, 14, 584, 72); // NEW first song
			context.drawImage(previews[parsedSongs[indices[1]].songUniqueName], 0, clippingY, 800, 100, 1216 - deltaTimeCalcs/5, 14 + deltaTimeCalcs/5, 584, 72); // first song
			context.drawImage(previews[parsedSongs[indices[2]].songUniqueName], 0, clippingY, 800, 100, 1116 - deltaTimeCalcs/5, 114 + deltaTimeCalcs/5, 584, 72); // before previous song
			context.drawImage(previews[parsedSongs[indices[3]].songUniqueName], 0, clippingY - clippingY * (deltaTimeCalcs/500), 800, 100 + deltaTimeCalcs/2.5, 1016 - deltaTimeCalcs/2.5, 214 + deltaTimeCalcs/5, 584 + deltaTimeCalcs/2.5, 72 + deltaTimeCalcs/2.5); // previous song
			context.drawImage(previews[parsedSongs[indices[4]].songUniqueName], 0, clippingY * (deltaTimeCalcs/500), 800, 300 - deltaTimeCalcs/2.5, 816 + deltaTimeCalcs/2.5, 314 + deltaTimeCalcs/(500/300), 784 - deltaTimeCalcs/2.5, 272 - deltaTimeCalcs/2.5); // chosen song
			context.drawImage(previews[parsedSongs[indices[5]].songUniqueName], 0, clippingY, 800, 100, 1016 + deltaTimeCalcs/5, 614 + deltaTimeCalcs/5, 584, 72); // next song
			context.drawImage(previews[parsedSongs[indices[7]].songUniqueName], 0, clippingY, 800, 100, 1216, 814, 584, 72); // last song
			context.drawImage(previews[parsedSongs[indices[6]].songUniqueName], 0, clippingY, 800, 100, 1116 + deltaTimeCalcs/5, 714 + deltaTimeCalcs/5, 584, 72); // after next song
		}else{ // down
			context.drawImage(previews[parsedSongs[indices[1]].songUniqueName], 0, clippingY, 800, 100, 1216, 14, 584, 72); // first song
			context.drawImage(previews[parsedSongs[indices[2]].songUniqueName], 0, clippingY, 800, 100, 1116 + deltaTimeCalcs/5, 114 - deltaTimeCalcs/5, 584, 72); // before previous song
			context.drawImage(previews[parsedSongs[indices[3]].songUniqueName], 0, clippingY, 800, 100, 1016 + deltaTimeCalcs/5, 214 - deltaTimeCalcs/5, 584, 72); // previous song
			context.drawImage(previews[parsedSongs[indices[4]].songUniqueName], 0, clippingY * (deltaTimeCalcs/500), 800, 300 - deltaTimeCalcs/2.5, 816 + deltaTimeCalcs/2.5, 314 - deltaTimeCalcs/5, 784 - deltaTimeCalcs/2.5, 272 - deltaTimeCalcs/2.5); // chosen song
			context.drawImage(previews[parsedSongs[indices[5]].songUniqueName], 0, clippingY - clippingY * (deltaTimeCalcs/500), 800, 100 + deltaTimeCalcs/2.5, 1016 - deltaTimeCalcs/2.5, 614 - deltaTimeCalcs/(500/300), 584 + deltaTimeCalcs/2.5, 72 + deltaTimeCalcs/2.5); // next song
			context.drawImage(previews[parsedSongs[indices[6]].songUniqueName], 0, clippingY, 800, 100, 1116 - deltaTimeCalcs/5, 714 - deltaTimeCalcs/5, 584, 72); // after next song
			context.drawImage(previews[parsedSongs[indices[8]].songUniqueName], 0, clippingY, 800, 100, 1216, 814, 584, 72); // NEW last song
			context.drawImage(previews[parsedSongs[indices[7]].songUniqueName], 0, clippingY, 800, 100, 1216 - deltaTimeCalcs/5, 814 - deltaTimeCalcs/5, 584, 72); // last song
		}
		if(deltaTime > 500){
			this.previewPlay.paused = true;
			this.movingSong = false;
			this.postLoadPreview(this);
			localStorageScore = loadLocalStorageScore(parsedSongs[this.chosenSong].songUniqueName);
			this.removeAnimation(this, "animChangeSong");
		}
		context.restore();
	}
}
