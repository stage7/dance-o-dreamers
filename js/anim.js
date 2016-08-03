// function animChangeSong(_this, time, previews, indices, direction){
// 	var deltaTime = currentTime - time;
// 	var deltaTimeCalcs = Math.min(500, deltaTime);
// 	var clippingY = 150-((300*72/219)/2);

// 	_this.previewPlay.volume = 1 - (deltaTimeCalcs/500);
// 	context.save();
// 	_this.clipSongChooserFrame();

// 	if(direction == -1){ // up
// 		context.drawImage(previews[parsedSongs[indices[0]].songUniqueName], 0, clippingY, 800, 100, 1216, 14, 584, 72); // NEW first song
// 		context.drawImage(previews[parsedSongs[indices[1]].songUniqueName], 0, clippingY, 800, 100, 1216 - deltaTimeCalcs/5, 14 + deltaTimeCalcs/5, 584, 72); // first song
// 		context.drawImage(previews[parsedSongs[indices[2]].songUniqueName], 0, clippingY, 800, 100, 1116 - deltaTimeCalcs/5, 114 + deltaTimeCalcs/5, 584, 72); // before previous song
// 		context.drawImage(previews[parsedSongs[indices[3]].songUniqueName], 0, clippingY - clippingY * (deltaTimeCalcs/500), 800, 100 + deltaTimeCalcs/2.5, 1016 - deltaTimeCalcs/2.5, 214 + deltaTimeCalcs/5, 584 + deltaTimeCalcs/2.5, 72 + deltaTimeCalcs/2.5); // previous song
// 		context.drawImage(previews[parsedSongs[indices[4]].songUniqueName], 0, clippingY * (deltaTimeCalcs/500), 800, 300 - deltaTimeCalcs/2.5, 816 + deltaTimeCalcs/2.5, 314 + deltaTimeCalcs/(500/300), 784 - deltaTimeCalcs/2.5, 272 - deltaTimeCalcs/2.5); // chosen song
// 		context.drawImage(previews[parsedSongs[indices[5]].songUniqueName], 0, clippingY, 800, 100, 1016 + deltaTimeCalcs/5, 614 + deltaTimeCalcs/5, 584, 72); // next song
// 		context.drawImage(previews[parsedSongs[indices[7]].songUniqueName], 0, clippingY, 800, 100, 1216, 814, 584, 72); // last song
// 		context.drawImage(previews[parsedSongs[indices[6]].songUniqueName], 0, clippingY, 800, 100, 1116 + deltaTimeCalcs/5, 714 + deltaTimeCalcs/5, 584, 72); // after next song
// 	}else{ // down
// 		context.drawImage(previews[parsedSongs[indices[1]].songUniqueName], 0, clippingY, 800, 100, 1216, 14, 584, 72); // first song
// 		context.drawImage(previews[parsedSongs[indices[2]].songUniqueName], 0, clippingY, 800, 100, 1116 + deltaTimeCalcs/5, 114 - deltaTimeCalcs/5, 584, 72); // before previous song
// 		context.drawImage(previews[parsedSongs[indices[3]].songUniqueName], 0, clippingY, 800, 100, 1016 + deltaTimeCalcs/5, 214 - deltaTimeCalcs/5, 584, 72); // previous song
// 		context.drawImage(previews[parsedSongs[indices[4]].songUniqueName], 0, clippingY * (deltaTimeCalcs/500), 800, 300 - deltaTimeCalcs/2.5, 816 + deltaTimeCalcs/2.5, 314 - deltaTimeCalcs/5, 784 - deltaTimeCalcs/2.5, 272 - deltaTimeCalcs/2.5); // chosen song
// 		context.drawImage(previews[parsedSongs[indices[5]].songUniqueName], 0, clippingY - clippingY * (deltaTimeCalcs/500), 800, 100 + deltaTimeCalcs/2.5, 1016 - deltaTimeCalcs/2.5, 614 - deltaTimeCalcs/(500/300), 584 + deltaTimeCalcs/2.5, 72 + deltaTimeCalcs/2.5); // next song
// 		context.drawImage(previews[parsedSongs[indices[6]].songUniqueName], 0, clippingY, 800, 100, 1116 - deltaTimeCalcs/5, 714 - deltaTimeCalcs/5, 584, 72); // after next song
// 		context.drawImage(previews[parsedSongs[indices[8]].songUniqueName], 0, clippingY, 800, 100, 1216, 814, 584, 72); // NEW last song
// 		context.drawImage(previews[parsedSongs[indices[7]].songUniqueName], 0, clippingY, 800, 100, 1216 - deltaTimeCalcs/5, 814 - deltaTimeCalcs/5, 584, 72); // last song
// 	}
// 	if(deltaTime > 500){
// 		localStorageScore = loadLocalStorageScore(parsedSongs[_this.chosenSong].songUniqueName);
// 		removeAnimation("animChangeSong");
// 		_this.previewPlay.paused = true;
// 		_this.movingSong = false;
// 		_this.postLoadPreview(_this);
// 	}
// 	context.restore();
// }

// function drawRating(time, asset){
// 	var scale = 1;
// 	if(currentTime - time <= 500){
// 		scale = (1-((currentTime-time)/500))*0.5+1;
// 	}
// 	context.drawImage(
// 		assets[asset],
// 		0,
// 		0,
// 		assets[asset].width,
// 		assets[asset].height,
// 		600 - ((assets[asset].width / 2) * scale - (assets[asset].width / 2)),
// 		405 - ((assets[asset].height / 2) * scale - (assets[asset].height / 2)),
// 		assets[asset].width * scale,
// 		assets[asset].height * scale);
// 	if(currentTime - time > 1000){
// 		removeAnimation("drawRating");
// 	}
// }

// function drawGameOver(time){
// 	removeAnimation("drawRating");
// 	if(currentTime - time <= 2000){
// 		context.fillStyle = "rgba(0, 0, 0, " + ((currentTime - time) / 4000) + ")";
// 		context.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
// 	}else{
// 		context.fillStyle = "rgba(0, 0, 0, 0.5)";
// 		context.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
// 		if(currentTime - time <= 4000){
// 				context.fillStyle = "rgba(255, 255, 255, " + ((currentTime - time - 2000) / 2000) + ")";
// 				context.strokeStyle = "rgba(0, 0, 0, " + ((currentTime - time - 2000) / 2000) + ")";
// 		}else{
// 			context.fillStyle = "rgba(255, 255, 255, 1)";
// 			context.strokeStyle = "rgba(0, 0, 0, 1)";
// 		}
// 		context.textBaseline = "middle";
// 		context.textAlign = "center";
// 		context.font = "60pt nukamiso";
// 		context.strokeText(languages["en"].gameOver, canvas.width/2, canvas.height/2);
// 		context.fillText(languages["en"].gameOver, canvas.width/2, canvas.height/2);
// 		context.textAlign = "start";
// 	}
// }

function drawAnimations(_this){
	for(var i=0; i<_this.animations.length; i++){
		var foo = _this[_this.animations[i][0]];
		foo.apply(_this, _this.animations[i][1]);
		//window[animations[i][0]].apply(_this, animations[i][1]);
	}
}

function removeAnimation(_this, item){
	for(var i = _this.animations.length - 1; i >= 0; i--){ // splice modifies the array indices, therefore backwards check is used
		if(_this.animations[i][0] === item){
			_this.animations.splice(i, 1);
		}
	}
}