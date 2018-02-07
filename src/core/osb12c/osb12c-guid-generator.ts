import { NumberHandlerUtil } from "@qsdt/common";

import * as ip from "ip";
import * as hashcode from "hashcode";

/**
 * @class Osb12cGuidGenerator
 * @see npm @qsdt/template-engine
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class is a Re-Implementation of the com.bea.wli.sb.util.Guid#generateGuid method from
 * the oracle.servicebus.utils.jar from the Oracle Service Bus 12c runtime. This is a 
 * rewrite of the code using the tools available to node js
 * 
 */
export class Osb12cGuidGenerator {

    private static readonly shortMIN_VAL: number = -32768;
    private static readonly shortMAX_VAL: number = 32767;

    private hostUnique = NumberHandlerUtil.randomIntInc(0, 2147483647)
    private randomThread = NumberHandlerUtil.randomIntInc(-2147483647, 2147483647)
    private time = (new Date).getTime();

    private lastCount = Osb12cGuidGenerator.shortMIN_VAL;
    private iastr;

    public generateOsb12cGUID() {
        if (this.lastCount == Osb12cGuidGenerator.shortMAX_VAL) {
            this.time = (new Date).getTime();
            this.lastCount = Osb12cGuidGenerator.shortMIN_VAL;
        }

        if (this.iastr == null) {
            let bytes = ip.address().split(".");

            let buf = Buffer.from([parseInt(bytes[0]), parseInt(bytes[1]), parseInt(bytes[2]), parseInt(bytes[3])]);
            this.iastr = buf.readInt32BE(0);
        }

        var count = this.lastCount++;
        return this.format(this.iastr) + "." +
            this.format(this.hostUnique) + "." +
            this.format(this.randomThread) + "." +
            this.format(this.time) + "." +
            this.format(count);
    }

    private format(value: number): string {
        if (value < 0) {
            return value.toString(16).replace("-", "N");
        } else {
            return value.toString(16);
        }
    }
}
