var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

var assets = {};
var items = ['./img/arrows.png',
			 './img/holder-life.png',
			 './img/life-meter.png',
			 './img/holder-points.png',
			 './img/score-meter.png',
			 './img/perfect.png',
			 './img/awesome.png',
			 './img/great.png',
			 './img/ok.png',
			 './img/bad.png',
			 './img/miss.png',
			 './img/song-chooser-frame.png',
			 './img/back-menu.png',

			 //Flags
			 './img/flags/flag_esp.png'];
var itemNames = ['arrows',
				 'holderLife',
				 'lifeMeter',
				 'holderPoints',
				 'scoreMeter',
				 'perfect',
				 'awesome',
				 'great',
				 'ok',
				 'bad',
				 'miss',
				 'songChooserFrame',
				 'backMenu',

				 //Flags
				 'flag_esp'];

// Following code by Paul Grime (http://stackoverflow.com/users/319878/paul-grime)
// From Stack Overflow (http://stackoverflow.com/questions/8682085/can-i-sync-up-multiple-image-onload-calls)
// Question by Noah (http://stackoverflow.com/users/499106/noah)
// CC BY-SA 3.0 license
// load will 'load' items by calling thingToDo for each item,
// before calling allDone when all the things to do have been done.
function loader(items, thingToDo, allDone, variable, variableNames) {
		if (!items) {
				// nothing to do.
				return;
		}

		if (items.length === "undefined") {
				// convert single item to array.
				items = [items];
		}

		var count = items.length;

		// this callback counts down the things to do.
		var thingToDoCompleted = function (items, i) {
				count--;
				if (count == 0) {
						allDone(items);
				}
		};

		for (var i = 0; i < items.length; i++) {
				// 'do' each thing, and await callback.
				thingToDo(items, i, thingToDoCompleted, variable, variableNames);
		}
}

function loadImage(items, i, onComplete, variable, variableNames) {
		var onLoad = function (e) {
				e.target.removeEventListener("load", onLoad);

				// this next line can be removed.
				// only here to prove the image was loaded.
				//document.body.appendChild(e.target);

				// notify that we're done.
				onComplete(items, i);
		}
		variable[variableNames[i]] = new Image();
		variable[variableNames[i]].addEventListener("load", onLoad, false);
		variable[variableNames[i]].src = items[i];
}

WebFontConfig = {
    custom: {
        families: ['nukamiso','swiss'],
        urls: ['./css/fonts.css']
    },
    active: function() {
		loader(items, loadImage, function(){}, assets, itemNames);
    }
};