import { StringContainer } from "@ab/common";

import { MappedExpression } from "./entity/mapped-expression";
import { IterationDefinition } from "./entity/iteration-definition";
import { TemplateContainer } from "./container/template.container";
import { PipeFunctionsProcessor } from "./pipe-functions.processor";
import { DefFunctionsProcessor } from "./def-functions.processor";

const subTmplReged = new RegExp(/(::)*([a-zA-Z0-9_./]*?)*(::)/g);
/**
 * @class TemplateProcessor
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This is the main class for template processing, it uses a Map<string, string> to process the template
 * into a filled artifact with its data.
 * 
 */
export class TemplateProcessor {

	/**
	 * Associated TemplateContainer
	 */
	private abtmplContainer: TemplateContainer;

	/**
	 * Constructs a Template Processor with an anonymous template
	 * @param stringTmpl string containing template contents
	 */
	constructor(stringTmpl: string);

	/**
	 * Construct a Templater Processor with an abtmpl file
	 * @param fileName abtmpl file name
	 * @param fileBuffer abtmpl Buffer with abtmpl contents
	 */
	constructor(fileName: string, fileBuffer: Buffer);

	constructor(param1: string, param2?: Buffer) {
		this.abtmplContainer = new TemplateContainer(param1, param2);
	}

	/**
	 * Runs the processor, checks if abtmpl is invalid or if the map is empty.
	 * This process puts the map's values into the mapped expressions following their defined 
	 * instructions.
	 * It will emit a warning if a map value from a non-optional mapped expression's mappedKey 
	 * is not found, resulting in a potential invalid generated artifact.
	 * 
	 * @param map map containing the data to put into mapped expressions
	 */
	public run(map: Map<string, string>): string {
		if (this.abtmplContainer.$invalid) {
			throw new Error(TemplateContainer.msgTmplInvalid);
		}
		if (map.size == 0) {
			throw new Error("Invalid Values Map: map is empty");
		}
		let workingResult: StringContainer = new StringContainer(this.abtmplContainer.$fileContents);
		for (var index = (this.abtmplContainer.$mapExprList.length - 1); index > -1; index--) {
			var mapExpr = this.abtmplContainer.$mapExprList[index];
			if (mapExpr.$isIterated) {
				workingResult.replaceRange(mapExpr.$startIndex, mapExpr.$endIndex, this.retrieveValueFromIterDef(mapExpr.$mappedKey));;
			} else {
				let mappedValue: string = map.get(mapExpr.$mappedKey);
				if (mappedValue == undefined && !mapExpr.$isOptional) {
					console.warn("Expected key '" + mapExpr.$mappedKey + "', but provided map doesn't have a value associated with it, expect an invalid generated artifact from template located in '" + this.abtmplContainer.$filename + "' or maybe you should set the Mapped Expression as optional");
				} else if (mappedValue == undefined && mapExpr.$isOptional) {
					workingResult.replaceRange(mapExpr.$startIndex, mapExpr.$endIndex, "");
				} else {
					if (mapExpr.$isTernary) {
						mappedValue = mappedValue != "" ? mapExpr.$ternaryTrue : mapExpr.$ternaryFalse ? mapExpr.$ternaryFalse : "";
					}
					if (mapExpr.$pipeFunctions && mapExpr.$pipeFunctions.length > 0) {
						mappedValue = PipeFunctionsProcessor.invoke(mapExpr.$pipeFunctions, mappedValue);
					}
					workingResult.replaceRange(mapExpr.$startIndex, mapExpr.$endIndex, mappedValue);
				}
			}
		}
		let iterDefRegex: RegExp = new RegExp(IterationDefinition.regex);
		workingResult.replace(iterDefRegex, "");

		return workingResult.toString();
	}

	/**
	 * Invokes the associated mapped function with the iterated mapped expression
	 * @param mappedKey iterated mapped expression's mappedKey to process with Iteration Definition
	 */
	private retrieveValueFromIterDef(mappedKey: string): string {
		let result: string;
		this.abtmplContainer.$iterDefList.forEach(iterDef => {
			if (iterDef.$mappedKey == mappedKey) {
				result = DefFunctionsProcessor.invoke(iterDef.$mappedFunction);
				return;
			}
		});
		return result;
	}

	/**
	 * Utility static method for boolean evaluation of a single MappedExpression with a corresponding map.
	 * It will return true only if a value is found from the mappedKey and is not "false", otherwise
	 * it returns false
	 * @param expression String containing a single MappedExpression
	 * @param map values map to use for processing
	 */
	public static evaluateBoolean(expression: string, map: Map<string,string>): boolean {
		const mapExpRegex = new RegExp(MappedExpression.regex);
		let result: RegExpExecArray = mapExpRegex.exec(expression);
		if (mapExpRegex.lastIndex == 0) {
			throw new Error("Invalid expression '"+expression+"' found trying to evaluate a boolean");
		}
		let expr: MappedExpression = new MappedExpression(result);
		let value: string = map.get(expr.$mappedKey);
		if (value) {
			if (value.toLowerCase() == "false") {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

}