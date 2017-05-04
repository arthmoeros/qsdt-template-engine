import { Annotation } from "@ab/common";

import { CoreDefinitionFunctions } from "./core/core-def-functions";

/**
 * @class DefFunctionsProcessor
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files and custom def functions
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class is used to invoke Definition Functions, for use with Iteration Definitions
 * 
 */
export class DefFunctionsProcessor {

	private static readonly coreDefFunctions: CoreDefinitionFunctions = new CoreDefinitionFunctions();

	private customDefFunctions: any;

	/**
	 * Creates a DefFunctionsProcessor, it can be supplied with custom functions from
	 * any instance, the contained methods must be annotated with @DefinitionFunction to be
	 * recognized as such
	 * @param customDefFunctions 
	 */
	constructor(customDefFunctions?: any) {
		this.customDefFunctions = customDefFunctions;
	}

	/**
	 * Invokes a function contained in configured def-functions.ts
	 * @param func Function's name
	 */
	public invoke(func: string): string {
		let coreDefFunctions = DefFunctionsProcessor.coreDefFunctions;
		let customDefFunctions = this.customDefFunctions;
		let coreDefFunction = coreDefFunctions[func];
		if (coreDefFunction && Reflect.getMetadata(Annotation.DefinitionFunction, coreDefFunctions, func)) {
			return coreDefFunction();
		} else if (customDefFunctions) {
			let customDefFunction = customDefFunctions[func];
			if (customDefFunction && Reflect.getMetadata(Annotation.DefinitionFunction, customDefFunctions, func)) {
				return customDefFunction();
			} else {
				throw new Error("Unknown DefinitionFunction: Didn't recognize DefinitionFunction named '" + func + "' in CoreDefinitionFunctions neither in CustomDefinitionFunctions provided (maybe decorator is missing or method is not defined)");
			}
		} else {
			throw new Error("Unknown DefinitionFunction: Didn't recognize DefinitionFunction named '" + func + "' in CoreDefinitionFunctions");
		}
	}
}