// -------------------
// ADD YOUR SONGS HERE
// -------------------

var songList = [
	"memories"
	];

// ----------------------------------------
// DO NOT MODIFY ANYTHING BELOW THIS LINE!!
// ----------------------------------------

var audioContext;
var bufferLoader;
var source;
var songCount = 0;

//load_json("./songs/memories/song.js");

function load_songs(){
	for(var i = 0; i < songList.length; i++){
		require(["./songs/" + songList[i] + "/song"], function(){
			addSongCount();
		});
	}
}

function addSongCount(){
	songCount++;
	if(songCount == songList.length){
		//alert("all loaded!");
		//console.log(songs);
		startGame();
	}
}

function loadAudio(song, file){
	// Fix up prefixing
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audioContext = new AudioContext();

	bufferLoader = new BufferLoader(
	  audioContext,
	  ['./songs/' + song + '/' + file],
	  postLoadSong
	  );

	bufferLoader.load();
}

// Following code by TechSpud (http://stackoverflow.com/users/1368849/techspud)
// From Stack Overflow (http://stackoverflow.com/a/19364118)
// Question by Patrick Browne (http://stackoverflow.com/users/934585/patrick-browne)
// CC BY-SA 3.0 license
function load_json(src) {
	var head = document.getElementsByTagName('head')[0];

	//use class, as we can't reference by id
	var element = head.getElementsByClassName("json")[0];

	try {
		element.parentNode.removeChild(element);
	} catch (e) {
	//
	}

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = src;
	//script.className = "json";
	script.async = false;
	head.appendChild(script);

	//call the postload function after a slight delay to allow the json to load
	//window.setTimeout(postloadfunction, 100)
}