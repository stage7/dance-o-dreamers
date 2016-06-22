function padLeftZeros(value, len){
	var returnValue = new Array(len + 1).join("0") + value;
	return returnValue.substr(returnValue.length - len);
}