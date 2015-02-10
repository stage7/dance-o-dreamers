var start = new Date();
var tNow = 0;
var currentMeasure = 0;
var keys = {};
var maxError = (1/bpm)*10; // range within the note is considered pressable
var note = 0;
var margin = 0;
var combo = 0;
var life = 100;
var songEnd = false;
var missedNote = false;

$(document).ready(ready());

function ready(){
	iteration = setInterval("main()", 20);

	$(document).keydown(function (e) {
		if (!songEnd) {
		    keys[e.which] = true;
		    testKeys(song[note][1], true);
	    }
	});

	$(document).keyup(function (e) {
		if (!songEnd) {
	    	delete keys[e.which];
	    	testKeys();
	    }
	});
}

function main(){
	var tDelta = tNow;
	var d = new Date();
	var t = d.toLocaleTimeString();
	tNow = d-start;
	tDelta = tNow - tDelta;
	moveRoll(tNow);

	//console.log(note);

	if(note < song.length){
		if(song[note][0]+maxError < currentMeasure)
			note++;
	}

	console.log("Diferencia: "+((60/bpm)*song[note][0] - (tNow/1000))+" -- Margen: "+(1/bpm)*50);

	if(note >= song.length) songEnd = true;

	/*$("body").keypress(function(event){
		event.preventDefault();
		switch(event.which){
			case(65): // left - A
				$("body").append("<p>test left</p>");
			break;
			case(87): // up - W
				alert("up");
			break;
			case(68): // right - D
				alert("right");
			break;
			case(83): // down - S
				alert("down");
			break;
		}
	});*/
}

function moveRoll(tNow){
	margin = -tNow/1000*300; // move 600 px up every second
	$(".roll").css("margin-top",margin+"px");

	currentMeasure = (bpm/60)*(tNow/1000);
	$(".measure").text(Math.floor(currentMeasure));
}

function printKeys() {
    var html = '';
    for (var i in keys) {
        if (!keys.hasOwnProperty(i)) continue;
        html += '<p>' + i + '</p>';
    }
    $('#out').html(html);
}

function testKeys(currentNote, isKeyDown) {
    for (var i in keys) {
        if (!keys.hasOwnProperty(i)) continue;
        //html += '<p>' + i + '</p>';
    }

    var positionClass = song[note][0]*100;
    missedNote = false;

    if(song[note][0] - (tNow/1000*300) < 50){
    	if(isKeyDown){
			var keysArray = $.map(keys, function(k, v) {
			    return [v];
			});

			var keysLength = keysArray.length;
			for (var j = 0; j < keysLength; j++) {
				console.log("Pressed: "+keysArray+" -- Current note: "+currentNote+" -- Index: "+currentNote.indexOf(parseInt(keysArray[j])));
				if(currentNote.indexOf(parseInt(keysArray[j])) != -1){
					console.log("WIN!");
					$(".pos"+positionClass).hide();
				} else {
					missedNote = true;
					break;
				}
			}
		} else {
			if(missedNote) {
				console.log("MISS!");
				$(".pos"+positionClass).hide();
				note++;
			}
		}
	}
}