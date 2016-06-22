var songList = [
	"memories",
	"thebomb",
	"insomnia"
];
var previews = {};
var itemsPreview = new Array();
var itemsPreviewNames = new Array();
var parsedSongs = [];
var songCount = 0;
var previousChosenSong = null;
var chosenSong = 0;
var indices = Array();
var localStorageScore;

//--------------------------
//USEFUL ANIMATION VARIABLES
//--------------------------
var movingSong = false;
var movedSongs = 0;

//-------------------
//SONG AUDIO PREVIEWS
//-------------------
var previewPlay;
var previewQueue;
var previewManifests = Array();
// var previewQueue = new createjs.LoadQueue();
// previewQueue.installPlugin(createjs.Sound);
// previewQueue.addEventListener("complete", postLoadPreview);
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);

//loadSongsMenu();

function loadSongsMenu() {
	for(var i = 0; i < songList.length; i++){
		require(["./songs/" + songList[i] + "/song"], function(){
			addSongCount();
		});
	}
}

function addSongCount() {
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
				sortSongs();
				//startMenu();
			},
			previews,
			itemsPreviewNames);
	}
}

function sortSongs() {
	parsedSongs.sort(function(a,b){
		var titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
		if(a.title < b.title) return -1;
		if(a.title > b.title) return 1;
		return 0;
	});
	console.log(parsedSongs[0]);
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
	previewQueue = null;
	previewQueue = new createjs.LoadQueue();
	previewQueue.installPlugin(createjs.Sound);
	previewQueue.addEventListener("complete", postLoadPreview);
	previewQueue.addEventListener("fileload", fileComplete);
	previewQueue.addEventListener("error", handleFileError);
	for(var i=0; i<parsedSongs.length; i++){
		//previewManifests.push([{id: "previewFile", src: './songs/' + parsedSongs[i].songUniqueName + '/preview.mp3'}]);
		previewQueue.loadFile({id: parsedSongs[i].songUniqueName + "Preview", src: './songs/' + parsedSongs[i].songUniqueName + '/preview.mp3', type:createjs.AbstractLoader.SOUND});
	}

	//postLoadPreview();
	localStorageScore = loadLocalStorageScore(parsedSongs[chosenSong].songUniqueName);
	startMenu();
}

function fileComplete(evt) {
	console.log("Event Callback file loaded ", evt);
}

function handleFileError(evt) {
	console.log("error ", evt);
	// An error occurred.
}

function postLoadPreview() {
	previewPlay = null;
	previewPlay = createjs.Sound.play(parsedSongs[chosenSong].songUniqueName + "Preview", {loop: -1});
	console.log(previewPlay);
}

function calculateChosenSong() {
	if(chosenSong < 0){
		chosenSong = parsedSongs.length - 1;
	}else if(chosenSong > parsedSongs.length - 1){
		chosenSong = 0;
	}
}

function startMenu(){
	requestAnimationFrame(startMenu);
	currentTime = timer.lap();

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "blue";
	context.rect(0, 0, 1600, 900);

	//Background preview
	//context.save();
	context.drawImage(assets['preview'], -400, 0, 2400, 900);
	//context.restore();
	//END background preview

	// Current song metadata and scores
	context.lineWidth = 3;
	context.textBaseline = "middle";
	context.textAlign = "start";
	context.fillStyle = "white";
	context.font = "40pt nukamiso";
	//console.log(parsedSongs[chosenSong].bpm);
	context.strokeText(parsedSongs[chosenSong].bpm + "BPM - " + languages["en"]["difficulty"] + " " + parsedSongs[chosenSong].difficulty, 40, 150);
	context.fillText(parsedSongs[chosenSong].bpm + "BPM - " + languages["en"]["difficulty"] + " " + parsedSongs[chosenSong].difficulty, 40, 150);
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
	clipSongChooserFrame();

	// Calculate song indices
	if(previousChosenSong != chosenSong){
		previousChosenSong = chosenSong;
		indices = Array();
		var parsedSongsLength = parsedSongs.length;
		for(var i=chosenSong-4; i<=chosenSong+4; i++){
			if(i < 0)
				indices.push((parsedSongsLength - (Math.abs(i)%parsedSongsLength)) % parsedSongsLength);
			else
				indices.push(i%parsedSongsLength);
		}
	}

	// Song pictures
	if(movingSong == false){
		var clippingY = 150-((300*72/219)/2);
		context.drawImage(previews[parsedSongs[indices[1]].songUniqueName], 0, clippingY, 800, 100, 1216, 14, 584, 72); // first song
		context.drawImage(previews[parsedSongs[indices[2]].songUniqueName], 0, clippingY, 800, 100, 1116, 114, 584, 72); // before previous song
		context.drawImage(previews[parsedSongs[indices[3]].songUniqueName], 0, clippingY, 800, 100, 1016, 214, 584, 72); // previous song
		context.drawImage(previews[parsedSongs[indices[4]].songUniqueName], 0, 0, 800, 300, 816, 314, 784, 272); // chosen song
		context.drawImage(previews[parsedSongs[indices[5]].songUniqueName], 0, clippingY, 800, 100, 1016, 614, 584, 72); // next song
		context.drawImage(previews[parsedSongs[indices[6]].songUniqueName], 0, clippingY, 800, 100, 1116, 714, 584, 72); // after next song
		context.drawImage(previews[parsedSongs[indices[7]].songUniqueName], 0, clippingY, 800, 100, 1216, 814, 584, 72); // last song

		// Song data
		context.textBaseline = "top";
		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.fillStyle = "white";
		context.font = "25pt nukamiso";
		context.strokeText(parsedSongs[indices[1]].title, 1250, 20, 340);
		context.fillText(parsedSongs[indices[1]].title, 1250, 20, 340);
		context.strokeText(parsedSongs[indices[2]].title, 1150, 120, 440);
		context.fillText(parsedSongs[indices[2]].title, 1150, 120, 440);
		context.strokeText(parsedSongs[indices[3]].title, 1050, 220, 540);
		context.fillText(parsedSongs[indices[3]].title, 1050, 220, 540);
		context.strokeText(parsedSongs[indices[4]].artist, 920, 370, 670);
		context.fillText(parsedSongs[indices[4]].artist, 920, 370, 670);
		context.strokeText(parsedSongs[indices[5]].title, 1050, 620, 540);
		context.fillText(parsedSongs[indices[5]].title, 1050, 620, 540);
		context.strokeText(parsedSongs[indices[6]].title, 1150, 720, 440);
		context.fillText(parsedSongs[indices[6]].title, 1150, 720, 440);
		context.strokeText(parsedSongs[indices[7]].title, 1250, 820, 340);
		context.fillText(parsedSongs[indices[7]].title, 1250, 820, 340);
		context.font = "15pt nukamiso";
		context.strokeText(parsedSongs[indices[1]].artist, 1250, 55, 340);
		context.fillText(parsedSongs[indices[1]].artist, 1250, 55, 340);
		context.strokeText(parsedSongs[indices[2]].artist, 1150, 155, 440);
		context.fillText(parsedSongs[indices[2]].artist, 1150, 155, 440);
		context.strokeText(parsedSongs[indices[3]].artist, 1050, 255, 540);
		context.fillText(parsedSongs[indices[3]].artist, 1050, 255, 540);
		context.strokeText(parsedSongs[indices[5]].artist, 1050, 655, 540);
		context.fillText(parsedSongs[indices[5]].artist, 1050, 655, 540);
		context.strokeText(parsedSongs[indices[6]].artist, 1150, 755, 440);
		context.fillText(parsedSongs[indices[6]].artist, 1150, 755, 440);
		context.strokeText(parsedSongs[indices[7]].artist, 1250, 855, 340);
		context.fillText(parsedSongs[indices[7]].artist, 1250, 855, 340);
		context.font = "40pt nukamiso";
		context.strokeText(parsedSongs[indices[4]].title, 920, 320, 670);
		context.fillText(parsedSongs[indices[4]].title, 920, 320, 670);
	}
	context.restore();
	context.fillStyle = "white";

	testKeysMenu();
	drawAnimations();
}

function testKeysMenu(){
	/* Keys down */
	if (keyState[KEY_LEFT] || keyState[KEY_A]){ // left, 'a'

	}
	if (keyState[KEY_UP] || keyState[KEY_W]){ // up, 'w'
		if(movingSong == false){
			chosenSong--;
			calculateChosenSong();
			//console.log(chosenSong);
			movingSong = true;
			animations.push(["animChangeSong", [currentTime, previews, indices, -1]]);
		}
	}
	if (keyState[KEY_RIGHT] || keyState[KEY_D]){ // right, 'd'

	}
	if (keyState[KEY_DOWN] || keyState[KEY_S]){ // down, 's'
		if(movingSong == false){
			chosenSong++;
			calculateChosenSong();
			//console.log(chosenSong);
			//console.log(indices);
			movingSong = true;
			//console.log(previewPlay);
			animations.push(["animChangeSong", [currentTime, previews, indices, 1]]);
		}
	}	
}

function clipSongChooserFrame(){
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

function animChangeSong(time, previews, indices, direction){
	var deltaTime = currentTime - time;
	var deltaTimeCalcs = Math.min(500, deltaTime);
	var clippingY = 150-((300*72/219)/2);

	previewPlay.volume = 1 - (deltaTimeCalcs/500);
	context.save();
	clipSongChooserFrame();

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
		previewPlay.paused = true;
		movingSong = false;
		postLoadPreview();
		localStorageScore = loadLocalStorageScore(parsedSongs[chosenSong].songUniqueName);
		removeAnimation("animChangeSong");
	}
	context.restore();
}
