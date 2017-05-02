var defFunctions = require("./../config/def-functions");

export class DefFunctionsProcessor {
	public static invoke(func: string): string {
		if (!eval("defFunctions." + func)) {
			throw new Error("Unknown DefFunction: Couldn't find a DefFunction named '" + func + "'");
		}
		return eval("defFunctions." + func + "();");
	}
}