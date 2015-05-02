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
		animations = [];
	}
}

function drawAnimations(){
	for(var i=0; i<animations.length; i++){
		window[animations[i][0]].apply(this, animations[i][1]);
	}
}
