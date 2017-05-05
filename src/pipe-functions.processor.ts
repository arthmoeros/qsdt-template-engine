import { Annotation } from "@artifacter/common";

import { CorePipeFunctions } from "./core/core-pipe-functions";

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
export class PipeFunctionsProcessor{

	private static readonly corePipeFunctions: CorePipeFunctions = new CorePipeFunctions();
	private customPipeFunctions: any;

	/**
	 * Creates a PipeFunctionsProcessor, it can be supplied with custom functions from
	 * any instance, the contained methods must be annotated with @PipeFunction to be
	 * recognized as such
	 * @param customPipeFunctions Instance of a CustomPipeFunctions to use
	 */
	constructor(customPipeFunctions?: any){
		this.customPipeFunctions = customPipeFunctions;
	}

	/**
	 * Invokes the pipeFunctions in sequential order, passing the processed
	 * value to the next one and returing the result of the last one
	 * @param functions array of pipe functions names
	 * @param inputValue input value to process in the pipes
	 */
	public invoke(functions: string[], inputValue: string): string{
		let corePipeFunctions = PipeFunctionsProcessor.corePipeFunctions;
		let customPipeFunctions = this.customPipeFunctions;
		let result: string = inputValue;
		functions.forEach(func => {
			let corePipeFunction = corePipeFunctions[func];
			if(corePipeFunction != null && Reflect.getMetadata(Annotation.PipeFunction, corePipeFunctions, func)){
				this.checkMethodIsValidPipeFunction(corePipeFunctions, func);
				result = corePipeFunction(result);
			}else if(customPipeFunctions != null){
				let customPipeFunction = customPipeFunctions[func];
				if(customPipeFunction != null && Reflect.getMetadata(Annotation.PipeFunction, customPipeFunctions, func)){
					this.checkMethodIsValidPipeFunction(customPipeFunctions, func);
					result = customPipeFunction(result);
				}else{
					throw new Error("Unknown PipeFunction: Didn't recognize PipeFunction named '"+func+"' in CorePipeFunctions neither in CustomPipeFunctions provided  (maybe decorator is missing or method is not defined)");
				}
			}else{
				throw new Error("Unknown PipeFunction: Didn't recognize PipeFunction named '"+func+"' in CorePipeFunctions");
			}
		});
		return result;
	}

	private checkMethodIsValidPipeFunction(instance: any, func: string){
		let designParamTypes = Reflect.getMetadata("design:paramtypes", instance, func);
		let designReturnType = Reflect.getMetadata("design:returntype", instance, func);
		if(designParamTypes == null || !(designParamTypes.length == 1 && designParamTypes[0].name == "String")){
			throw new Error("Invalid PipeFunction: found PipeFunction named '"+func+"', but it doesn't match the paramtypes requirement of [String]");
		}
		if(designReturnType == null || designReturnType.name != "String"){
			throw new Error("Invalid PipeFunction: found PipeFunction named '"+func+"', but it doesn't match the returntype requirement of [String]");
		}
	}
}