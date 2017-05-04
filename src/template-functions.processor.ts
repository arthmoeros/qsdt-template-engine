import { Annotation } from "@artifacter/common";

import { CoreTemplateFunctions } from "./core/core-template-functions";

/**
 * @class TemplateFunctionsProcessor
 * @see npm @artifacter/template-processor
 * @see also README.md of this project for an explanation about atmpl files and custom def functions
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class is used to invoke Template Functions, for use with Declared Iterations
 * 
 */
export class TemplateFunctionsProcessor {

	private static readonly coreTmplFunctions: CoreTemplateFunctions = new CoreTemplateFunctions();

	private customTmplFunctions: any;

	/**
	 * Creates a TemplateFunctionsProcessor, it can be supplied with custom functions from
	 * any instance, the contained methods must be annotated with @TemplateFunction to be
	 * recognized as such
	 * @param customTmplFunctions 
	 */
	constructor(customTmplFunctions?: any) {
		this.customTmplFunctions = customTmplFunctions;
	}

	/**
	 * Invokes a function contained in configured def-functions.ts
	 * @param func Function's name
	 */
	public invoke(func: string): string {
		let coreTmplFunctions = TemplateFunctionsProcessor.coreTmplFunctions;
		let customTmplFunctions = this.customTmplFunctions;
		let coreTmplFunction = coreTmplFunctions[func];
		if (coreTmplFunction && Reflect.getMetadata(Annotation.TemplateFunction, coreTmplFunctions, func)) {
			return coreTmplFunction();
		} else if (customTmplFunctions) {
			let customTmplFunction = customTmplFunctions[func];
			if (customTmplFunction && Reflect.getMetadata(Annotation.TemplateFunction, customTmplFunctions, func)) {
				return customTmplFunction();
			} else {
				throw new Error("Unknown TemplateFunction: Didn't recognize TemplateFunction named '" + func + "' in CoreTemplateFunctions neither in CustomTemplateFunctions provided (maybe decorator is missing or method is not defined)");
			}
		} else {
			throw new Error("Unknown TemplateFunction: Didn't recognize TemplateFunction named '" + func + "' in CoreTemplateFunctions");
		}
	}
}