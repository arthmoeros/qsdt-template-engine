export function aup(str: string){
	str = str.toUpperCase();
	return str;
}
export function sixPaddLeftZero(str: string){
	if(str.length >= 6){
		return str.substr(str.length-6, 6);
	}else{
		var remaining = 6 - str.length;
		var zeroes = "";
		for (var index = 0; index < remaining; index++) {
			zeroes = zeroes.concat("0");
		}
		return zeroes.concat(str);
	}
}
export function prefixUnderscore(str: string){
	if(str == ""){
		return "";
	}else{
		return "_"+str;
	}
}