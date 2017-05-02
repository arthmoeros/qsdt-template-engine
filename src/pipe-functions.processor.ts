var pipeFunctions = require("./../config/pipe-functions");

/**
 * @class PipeFunctionsProcessor
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class is used to invoke Pipe Functions, for use with normal Mapped Expressions
 * containing pipeFunctions definition
 * 
 */
export class PipeFunctionsProcessor{

	/**
	 * Invokes the pipeFunctions in sequential order, passing the processed
	 * value to the next one and returing the result of the last one
	 * @param functions array of pipe functions names
	 * @param inputValue input value to process in the pipes
	 */
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