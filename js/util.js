function padLeftZeros(value, len){
	var returnValue = new Array(len + 1).join("0") + value;
	return returnValue.substr(returnValue.length - len);
}

function checkKeyReleased(key){
	if (keyState[key] && !lockedKeys[key]){
		lockedKeys[key] = true;
		return true;
	}else if(!keyState[key]){
		lockedKeys[key] = false;
		return false;
	}
}

function loadScreen(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	context.fillRect(0, 0, 1600, 900);
	context.lineWidth = 3;
	context.textBaseline = "middle";
	context.textAlign = "start";
	context.fillStyle = "white";
	context.font = "40pt nukamiso";
	context.strokeStyle = "black";
	context.strokeText(languages["en"]["loading"], 20, 850);
	context.fillText(languages["en"]["loading"], 20, 850);
	//loadScreen();
}