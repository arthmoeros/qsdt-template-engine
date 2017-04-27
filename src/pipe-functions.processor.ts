var pipeFunctions = require("./../config/pipe-functions");

export class PipeFunctionsProcessor{
	public static invoke(functions: string[], inputValue: string): string{
		let result: string = inputValue;
		functions.forEach(func => {
			if(!eval("pipeFunctions."+func)){
				throw new Error("Unknown PipeFunction: Couldn't find a PipeFunction named '"+func+"'");
			}
			result = eval("pipeFunctions."+func+"('"+result+"');");
		});
		return result;
	}
}