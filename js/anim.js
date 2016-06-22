function drawRating(time, asset){
	var scale = 1;
	if(currentTime - time <= 500){
		scale = (1-((currentTime-time)/500))*0.5+1;
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
	if(currentTime - time > 1000){
		removeAnimation("drawRating");
	}
}

function drawGameOver(time){
	removeAnimation("drawRating");
	if(currentTime - time <= 2000){
		context.fillStyle = "rgba(0, 0, 0, " + ((currentTime - time) / 4000) + ")";
		context.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
	}else{
		context.fillStyle = "rgba(0, 0, 0, 0.5)";
		context.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
		if(currentTime - time <= 4000){
				context.fillStyle = "rgba(255, 255, 255, " + ((currentTime - time - 2000) / 2000) + ")";
				context.strokeStyle = "rgba(0, 0, 0, " + ((currentTime - time - 2000) / 2000) + ")";
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

function drawAnimations(){
	for(var i=0; i<animations.length; i++){
		window[animations[i][0]].apply(this, animations[i][1]);
	}
}

function removeAnimation(item){
	for(var i = animations.length - 1; i >= 0; i--){ // splice modifies the array indices, therefore backwards check is used
		if(animations[i][0] === item){
			animations.splice(i, 1);
		}
	}
}