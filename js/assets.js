var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

var img = new Array();
var items = ['./img/arrow0.png',
             './img/arrow1.png',
             './img/arrow2.png',
             './img/arrow3.png',
             './img/arrows.png'];

// Following code by Paul Grime (http://stackoverflow.com/users/319878/paul-grime)
// From Stack Overflow (http://stackoverflow.com/questions/8682085/can-i-sync-up-multiple-image-onload-calls)
// Question by Noah (http://stackoverflow.com/users/499106/noah)
// CC BY-SA 3.0 license
// load will 'load' items by calling thingToDo for each item,
// before calling allDone when all the things to do have been done.
function loader(items, thingToDo, allDone) {
    if (!items) {
        // nothing to do.
        return;
    }

    if ("undefined" === items.length) {
        // convert single item to array.
        items = [items];
    }

    var count = items.length;

    // this callback counts down the things to do.
    var thingToDoCompleted = function (items, i) {
        count--;
        if (0 == count) {
            allDone(items);
        }
    };

    for (var i = 0; i < items.length; i++) {
        // 'do' each thing, and await callback.
        thingToDo(items, i, thingToDoCompleted);
    }
}

function loadImage(items, i, onComplete) {
    var onLoad = function (e) {
        e.target.removeEventListener("load", onLoad);

        // this next line can be removed.
        // only here to prove the image was loaded.
        //document.body.appendChild(e.target);

        // notify that we're done.
        onComplete(items, i);
    }
    img[i] = new Image();
    img[i].addEventListener("load", onLoad, false);
    img[i].src = items[i];
}

loader(items, loadImage, function () {
    //alert("done");
});