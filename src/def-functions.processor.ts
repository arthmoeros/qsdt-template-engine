var defFunctions = require("./../config/def-functions");

/**
 * @class DefFunctionsProcessor
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class is used to invoke Definition Functions, for use with Iteration Definitions
 * 
 */
export class DefFunctionsProcessor {

	/**
	 * Invokes a function contained in configured def-functions.ts
	 * @param func Function's name
	 */
	public static invoke(func: string): string {
		if (!eval("defFunctions." + func)) {
			throw new Error("Unknown DefFunction: Couldn't find a DefFunction named '" + func + "'");
		}
		return eval("defFunctions." + func + "();");
	}
}