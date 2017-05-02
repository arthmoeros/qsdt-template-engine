const shortMIN_VAL = -32768;
const shortMAX_VAL = 32767;
const ip = require("ip");
const hashcode = require("hashcode").hashCode;

var hostUnique = randomIntInc(0,2147483647)
var time = (new Date).getTime();
var lastCount = shortMIN_VAL;
var iastr;
export function generateOsb11gGUID(){
    if(lastCount == shortMAX_VAL){
        time = (new Date).getTime();
        lastCount = shortMIN_VAL;
    }
    if(iastr == null){
        var hash = hashcode().value(ip.address());
        var rndLong = randomIntInc(-9223372036854775808, 9223372036854775807) + hash;
        if(rndLong < 0){
            rndLong = rndLong * -1;
        }
        iastr = rndLong;
    }
    var count = lastCount++;
    return iastr + "-" + hostUnique.toString(16) + "." + time.toString(16) + "." + count.toString(16);;
}

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}