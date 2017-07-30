import { Annotation } from "@artifacter/common";

import { CorePipeFunctions } from "./core/core-pipe-functions";
import { CustomPipeFunctions } from "./core/custom-pipe-functions";

/**
 * @class PipeFunctionsProcessor
 * @see npm @artifacter/template-engine
 * @see also README.md of this project for an explanation about atmpl files and custom pipe functions
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class is used to invoke Pipe Functions, for use with normal Mapped Expressions
 * containing pipeFunctions definition
 * 
 */
export class PipeFunctionsProcessor {

	private static readonly corePipeFunctions: CorePipeFunctions = new CorePipeFunctions();
	private customPipeFunctions: CustomPipeFunctions;

	/**
	 * Creates a PipeFunctionsProcessor, it can be supplied with custom functions previously
	 * added to a CustomPipeFunctions instance
	 * @param customPipeFunctions Instance of a CustomPipeFunctions to use
	 */
	constructor(customPipeFunctions?: CustomPipeFunctions) {
		this.customPipeFunctions = customPipeFunctions;
	}

	/**
	 * Invokes the pipeFunctions in sequential order, passing the processed
	 * value to the next one and returing the result of the last one, core functions are prioritized
	 * over custom in case a duplicate function name occurs
	 * @param functions array of pipe functions names and parameters
	 * @param inputValue input value to process in the pipes
	 */
	public invoke(functions: string[], inputValue: string): string {
		let corePipeFunctions = PipeFunctionsProcessor.corePipeFunctions;
		let customPipeFunctions = this.customPipeFunctions;
		let result: string = inputValue.toString();
		functions.forEach(func => {
			let pipeFunction: { name: string, parameters?: string[] } = this.parsePipeFunction(func);
			let corePipeFunction: Function = corePipeFunctions[pipeFunction.name];
			if (corePipeFunction != null) {
				let args: string[] = [result]
				if (pipeFunction.parameters != null) {
					args = args.concat(pipeFunction.parameters);
				}
				result = corePipeFunction.apply(null, args);
			} else if (customPipeFunctions != null) {
				result = customPipeFunctions.invoke(pipeFunction.name, result, pipeFunction.parameters);
			} else {
				throw new Error("Unknown PipeFunction: Didn't recognize PipeFunction named '" + func + "' in CorePipeFunctions and no CustomPipeFunctions were defined");
			}
		});
		return result;
	}

	private parsePipeFunction(func: string): { name: string, parameters?: string[] } {
		if (func.indexOf("[") != -1) {
			let name: string = func.substring(0, func.indexOf("["));
			let parameters: string[] = func.substring(func.indexOf("[") + 1, func.indexOf("]")).split(",");
			for (var index = 0; index < parameters.length; index++) {
				var param = parameters[index].trim();
				if(param.indexOf("'") == 0 || param.indexOf("\"") == 0){
					param = param.substring(1,param.length-1);
				}
				parameters[index] = param;
			}
			return { name: name, parameters: parameters };
		}else{
			return { name: func };
		}
	}
}