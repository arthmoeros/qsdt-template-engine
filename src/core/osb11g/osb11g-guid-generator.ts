import * as ip from "ip";
import * as hashcode from "hashcode";
//private static readonly hashcode = require("hashcode").hashCode;

/**
 * @class Osb11gGuidGenerator
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class is a Port of the com.bea.wli.sb.util.Guid#generateGuid method from
 * the com.bea.alsb.utils.jar from the Oracle Service Bus 11g runtime, it includes
 * its dependency from the Java java.rmi.server.UID constructor. This is a 
 * rewrite of the code using the tools available to node js
 * 
 */
export class Osb11gGuidGenerator {

    private static readonly shortMIN_VAL: number = -32768;
    private static readonly shortMAX_VAL: number = 32767;

    private hostUnique = Osb11gGuidGenerator.randomIntInc(0, 2147483647)
    private time = (new Date).getTime();

    private lastCount = Osb11gGuidGenerator.shortMIN_VAL;
    private iastr;

    public generateOsb11gGUID() {
        if (this.lastCount == Osb11gGuidGenerator.shortMAX_VAL) {
            this.time = (new Date).getTime();
            this.lastCount = Osb11gGuidGenerator.shortMIN_VAL;
        }
        if (this.iastr == null) {
            var hash = hashcode.hashCode().value(ip.address());
            var rndLong = Osb11gGuidGenerator.randomIntInc(-9223372036854775808, 9223372036854775807) + hash;
            if (rndLong < 0) {
                rndLong = rndLong * -1;
            }
            this.iastr = rndLong;
        }
        var count = this.lastCount++;
        return this.iastr + "-" + this.hostUnique.toString(16) + "." + this.time.toString(16) + "." + count.toString(16);;
    }

    /**
     * Generates a pseudorandom between low and high values inclusive
     * TODO: This should be on a utility class on @ab/common
     * @param low 
     * @param high 
     */
    private static randomIntInc(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }
}
