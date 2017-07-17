import { StringContainer } from "@artifacter/common";

import { SubTemplate } from "./entity/sub-template";
import { ObjectPropertyLocator } from "./locator/object-property-locator";
import { TemplateScanner, ElementMatch } from "./core/template-scanner";
import { MappedExpression } from "./entity/mapped-expression";
import { DeclaredIteration } from "./entity/declared-iteration";
import { TemplateContainer } from "./container/template.container";
import { PipeFunctionsProcessor } from "./pipe-functions.processor";
import { DeclaredIterationProcessorsMap } from "./declared-iteration-processors-map";
import { DeclaredIterationProcessor } from "./core/declared-iteration-processor";
import { CustomPipeFunctions } from "./core/custom-pipe-functions";

const subTmplReged = new RegExp(/(::)*([a-zA-Z0-9_./]*?)*(::)/g);
/**
 * @class TemplateProcessor
 * @see npm @artifacter/template-engine
 * @see also README.md of this project for an explanation about atmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This is the main class for template processing, it uses a Map<string, string> to process the template
 * into a filled artifact with its data.
 * 
 */
export class TemplateProcessor {

	/**
	 * Template contents
	 */
	private templateContents: string;

	/**
	 * Global Input Object
	 */
	private globalInput: {};

	/**
	 * ForEach iteration input object
	 */
	private foreachInput: {};

	/**
	 * Found declared iterations
	 */
	private declaredIterations: DeclaredIteration[] = [];

	/**
	 * Added template parameters for parameterized expressions
	 */
	private templateParameters: any;

	/**
	 * PipeFunctions processor
	 */
	private pipeFunctionsProcessor: PipeFunctionsProcessor;

	/**
	 * DeclaredIterationProcessorsMap
	 */
	private declaredIterationProcessorsMap: DeclaredIterationProcessorsMap;

	/**
	 * Optionality by default flag
	 */
	private optionalityByDefault: boolean;

	/**
	 * Parent processor if this is a nested one
	 */
	private parentProcessor: TemplateProcessor;

	/**
	 * This processed template's name
	 */
	private templateName: string;

	/**
	 * Constructs a Template Processor with an anonymous template
	 * @param stringTmpl string containing template contents
	 * @param optionalityByDefault makes all mapped expressions optional by default
	 */
	constructor(templateName: string, stringTmpl: string, optionalityByDefault?: boolean);

	/**
	 * Construct a Templater Processor with an atmpl file and optional custom pipe functions and custom template functions
	 * @param fileName atmpl file name
	 * @param fileBuffer atmpl Buffer with atmpl contents
	 * @param customPipeFunctions Custom Pipe Functions to use, it must contain methods annotated with @PipeFunction
	 * @param declaredIterationProcessors Custom Declared Iteration Processors to use, these must extend the class DeclaredIterationProcessor
	 */
	constructor(fileName: string, fileBuffer: Buffer, optionalityByDefault?: boolean, customPipeFunctions?: CustomPipeFunctions, declaredIterationProcessors?: DeclaredIterationProcessor[]);

	constructor(parentProcessor: TemplateProcessor, nestedContents: string);

	constructor(param1: string | TemplateProcessor, param2: Buffer | string, param3?: boolean, param4?: CustomPipeFunctions, param5?: DeclaredIterationProcessor[]) {
		if (param1 instanceof TemplateProcessor && typeof (param2) == "string") {
			this.parentProcessor = param1;
			this.templateName = param1.templateName;
			this.globalInput = param1.globalInput;
			this.declaredIterationProcessorsMap = param1.declaredIterationProcessorsMap;
			this.declaredIterations = param1.declaredIterations;
			this.optionalityByDefault = param1.optionalityByDefault;
			this.pipeFunctionsProcessor = param1.pipeFunctionsProcessor;
			this.templateParameters = param1.templateParameters;
			this.templateContents = param2;
		} else if (typeof (param1) == "string") {
			if (param1 == null) {
				this.templateName = "(anonymous template)";
			} else {
				this.templateName = param1;
			}
			if (param2 instanceof Buffer) {
				this.templateContents = param2.toString();
			} else if (typeof (param2) == "string") {
				this.templateContents = param2;
			}
			this.optionalityByDefault = param3;
			this.pipeFunctionsProcessor = new PipeFunctionsProcessor(param4);
			this.declaredIterationProcessorsMap = new DeclaredIterationProcessorsMap(param5);
		}
	}

	/**
	 * Sets up Template Parameters for use with parameterized expressions, if the processed
	 * template has parameterized expressions, these parameters must be set before the 
	 * processor is run, otherwise it will raise an error
	 */
	public setTemplateParameters(templateParameters: any) {
		this.templateParameters = templateParameters;
	}

	/**
	 * Runs the processor, checks if atmpl is invalid or if the map is empty.
	 * This process puts the map's values into the mapped expressions following their defined 
	 * instructions.
	 * It will emit a warning if a map value from a non-optional mapped expression's mappedKey 
	 * is not found, resulting in a potential invalid generated artifact.
	 * 
	 * @param map map containing the data to put into mapped expressions
	 */
	public run(input: {}, parentInput?: {}): string {
		if (this.parentProcessor != null && parentInput == null) {
			throw new Error("This is a nested processor but no parent input was provided");
		}
		let workingResult: StringContainer = new StringContainer(this.templateContents);
		this.declaredIterationProcessorsMap.initializeProcessors();

		let scanner: TemplateScanner = new TemplateScanner(this.templateContents);
		let matches: ElementMatch[] = scanner.run();
		while (true) {
			let currentMatch: ElementMatch = matches.shift();
			if (currentMatch == null) {
				break;
			} else {
				this.processMatch(currentMatch, matches, workingResult, input, parentInput);
			}
		}

		// remove all declared iterations from the result
		let iterDecRegex: RegExp = new RegExp(DeclaredIteration.regex);
		workingResult.replace(iterDecRegex, "");

		// remove all foreachs and if blocks
		let forEachRegexStart: RegExp = new RegExp(SubTemplate.regexForEachStart);
		let forEachRegexEnd: RegExp = new RegExp(SubTemplate.regexForEachEnd);
		let ifRegexStart: RegExp = new RegExp(SubTemplate.regexIfStart);
		let ifRegexEnd: RegExp = new RegExp(SubTemplate.regexIfEnd);
		while (forEachRegexStart.test(workingResult.toString())) {
			workingResult.replace(forEachRegexStart, "");
		}
		while (forEachRegexEnd.test(workingResult.toString())) {
			workingResult.replace(forEachRegexEnd, "");
		}
		while (ifRegexStart.test(workingResult.toString())) {
			workingResult.replace(ifRegexStart, "");
		}
		while (ifRegexEnd.test(workingResult.toString())) {
			workingResult.replace(ifRegexEnd, "");
		}

		return workingResult.toString();
	}

	private processMatch(currentMatch: ElementMatch, matches: ElementMatch[], workingResult: StringContainer, input: {}, parentInput?: {}) {
		if (currentMatch.type == "mappedExpression") {
			this.processMappedExpression(currentMatch.regex, workingResult, input, parentInput);
		} else if (currentMatch.type == "declaredIteration") {
			this.processDeclaredIteration(currentMatch.regex);
		} else if (currentMatch.type == "forEachBlock") {
			this.processForEachBlock(currentMatch.regex, matches, workingResult, input, parentInput);
		} else if (currentMatch.type == "ifBlock") {
			this.processIfBlock(currentMatch.regex, matches, workingResult, input, parentInput);
		}
	}

	private processForEachBlock(regexec: RegExpExecArray, matches: ElementMatch[], workingResult: StringContainer, input: {}, parentInput?: {}) {
		let syntaxRegex: RegExp = new RegExp(SubTemplate.validSyntaxForeach);
		let expr: RegExpExecArray = syntaxRegex.exec(regexec[2]);
		if (expr == null) {
			throw new Error(`ForEach block has invalid syntax, found: ${regexec[0]}`);
		}
		let iteratedName: string = expr[1];
		let listName: string = expr[2];

		let list: any[] = ObjectPropertyLocator.lookup(input, listName);
		if (parentInput != null && list == null) {
			list = ObjectPropertyLocator.lookup(parentInput, listName);
		}
		if (list == null) {
			throw new Error(`Array named ${listName} wasn't found on input, neither in parentInput (if any)`);
		}

		let startIndex: number = regexec.index + regexec[0].length;
		let endIndex: number = null;

		let nestedForEachBlocksFound: number = 0;
		while (true) {
			let currentMatch: ElementMatch = matches.shift();
			if (currentMatch == null) {
				throw new Error("Reached the end of matches and didn't find the closing ForEach block");
			}
			if (currentMatch.type == "forEachBlock") {
				nestedForEachBlocksFound++;
			}
			if (currentMatch.type == "forEachBlockEnd") {
				if (nestedForEachBlocksFound > 0) {
					nestedForEachBlocksFound--;
				} else {
					endIndex = currentMatch.regex.index;
					break;
				}
			}
		}
		let subTemplate: string = workingResult.toString().substring(startIndex + workingResult.$offset, endIndex + workingResult.$offset);
		let replacementString: StringContainer = new StringContainer();
		list.forEach((item) => {
			let childProcessor: TemplateProcessor = new TemplateProcessor(this, subTemplate);
			let subInput: {} = {}
			subInput[iteratedName] = item;
			if (parentInput == null) {
				parentInput = input;
			} else {
				subInput = Object.assign(subInput, input);
			}
			replacementString.append(childProcessor.run(subInput, parentInput));
		})
		let offset: number = workingResult.$offset;
		workingResult.replaceRange(startIndex + offset, endIndex + offset, replacementString.toString());
		workingResult.$offset += replacementString.toString().length - (endIndex - startIndex);
	}

	private processIfBlock(regexec: RegExpExecArray, matches: ElementMatch[], workingResult: StringContainer, input: {}, parentInput?: {}) {
		let expr: string = regexec[2];
		if (!SubTemplate.validSyntaxIf.test(expr)) {
			throw new Error(`If block has invalid syntax, found: ${regexec[0]}`);
		}
		let startIndex: number = regexec.index;
		let endIndex: number = null;
		let foundValue: any = ObjectPropertyLocator.lookup(input, expr);
		if (foundValue == null) {
			let nestedIfBlocksFound: number = 0;
			while (true) {
				let currentMatch: ElementMatch = matches.shift();
				if (currentMatch == null) {
					throw new Error("Reached the end of matches and didn't find the closing If block");
				}
				if (currentMatch.type == "ifBlock") {
					nestedIfBlocksFound++;
				}
				if (currentMatch.type == "ifBlockEnd") {
					if (nestedIfBlocksFound > 0) {
						nestedIfBlocksFound--;
					} else {
						endIndex = currentMatch.regex.index + currentMatch.regex[0].length;
						break;
					}
				}
			}
			let offset: number = workingResult.$offset;
			workingResult.replaceRange(startIndex + offset, endIndex + offset, "");
			workingResult.$offset += 0 - (endIndex - startIndex);
		}
	}

	private processDeclaredIteration(regexec: RegExpExecArray) {
		let decIter: DeclaredIteration = new DeclaredIteration(regexec);
		this.declaredIterations.push(decIter);
	}

	private processMappedExpression(regexec: RegExpExecArray, workingResult: StringContainer, input: {}, parentInput?: {}) {
		let mapExpr: MappedExpression = new MappedExpression(regexec);
		if (mapExpr.$invalidExprMsg != null) {
			throw new Error("Invalid Expression found: " + JSON.stringify(mapExpr.$invalidExprMsg));
		}
		let offset: number = workingResult.$offset;
		if (mapExpr.$isIterated) {
			let replacementString: string = this.retrieveValueFromIterDec(mapExpr.$mappedKey);
			workingResult.replaceRange(mapExpr.$startIndex + offset, mapExpr.$endIndex + offset, replacementString);
			workingResult.$offset += replacementString.length - regexec[0].length;
		} else if (mapExpr.$isParameterized) {
			if (this.templateParameters == null) {
				throw new Error("Invalid Processor state: found Parameterized Expression, but no template parameters are set");
			} else if (this.templateParameters[mapExpr.$mappedKey] == null) {
				console.warn("Expected parameter name '" + mapExpr.$mappedKey + "', but provided template parameters doesn't have a value associated with it, expect an invalid generated artifact from template located in '" + this.templateName + "'");
			} else {
				let paramProcessor: TemplateProcessor = new TemplateProcessor("(Parameterized)", this.templateParameters[mapExpr.$mappedKey], true);
				let replacementString: string = paramProcessor.run(input);
				workingResult.replaceRange(mapExpr.$startIndex + offset, mapExpr.$endIndex + offset, replacementString);
				workingResult.$offset += replacementString.length - regexec[0].length;
			}
		} else {
			let mappedValue: string = ObjectPropertyLocator.lookup(input, mapExpr.$mappedKey);
			if (mappedValue == null) {
				mappedValue = ObjectPropertyLocator.lookup(parentInput, mapExpr.$mappedKey);
			}
			if (mappedValue == undefined && !mapExpr.$isOptional && !this.optionalityByDefault) {
				console.warn("Expected key '" + mapExpr.$mappedKey + "', but provided map doesn't have a value associated with it, expect an invalid generated artifact from template located in '" + this.templateName + "' or maybe you should set the Mapped Expression as optional");
			} else if (mappedValue == undefined && (mapExpr.$isOptional || this.optionalityByDefault)) {
				workingResult.replaceRange(mapExpr.$startIndex + offset, mapExpr.$endIndex + offset, "");
				workingResult.$offset += 0 - regexec[0].length;
			} else {
				if (mapExpr.$isTernary) {
					mappedValue = this.evaluateTernary(mappedValue, mapExpr);
				}
				if (mapExpr.$pipeFunctions && mapExpr.$pipeFunctions.length > 0) {
					mappedValue = this.pipeFunctionsProcessor.invoke(mapExpr.$pipeFunctions, mappedValue);
				}
				workingResult.replaceRange(mapExpr.$startIndex + offset, mapExpr.$endIndex + offset, mappedValue);
				workingResult.$offset += mappedValue.length - regexec[0].length;
			}
		}
	}



	/**
	 * Invokes the associated mapped function with the iterated mapped expression
	 * @param mappedKey iterated mapped expression's mappedKey to process with Declared Iteration
	 */
	private retrieveValueFromIterDec(mappedKey: string): string {
		let result: string = null;
		this.declaredIterations.forEach(iterDec => {
			if (iterDec.$mappedKey == mappedKey) {
				result = this.declaredIterationProcessorsMap.invoke(iterDec.$mappedProcessor);
				return;
			}
		});
		if (result == null) {
			throw new Error(`Iterated mapped expression references a declared iteration key '${mappedKey}' but no declared iteration is defined with this key.`);
		}
		return result;
	}

	/**
	 * Evaluates a ternary within a mapped expression, it determines if the ternary is a
	 * boolean expression or just a check of a not empty string
	 * @param mappedValue Mapped Value found
	 * @param mapExpr Mapped Expression to which contains a ternary to evaluate
	 */
	private evaluateTernary(mappedValue: string, mapExpr: MappedExpression): string {
		if (mapExpr.$ternaryIsBooleanEvaluated) {
			if (!/\b[0-9]+\b/.test(mappedValue)) {
				mappedValue = `'${mappedValue}'`;
			}
			let booleanExpr: string = mapExpr.$ternaryBooleanExpression.replace(mapExpr.$mappedKey, mappedValue);
			let evaluationResult: boolean = eval(booleanExpr);
			return evaluationResult ? mapExpr.$ternaryTrue : mapExpr.$ternaryFalse ? mapExpr.$ternaryFalse : "";
		} else {
			return mappedValue != "" ? mapExpr.$ternaryTrue : mapExpr.$ternaryFalse ? mapExpr.$ternaryFalse : ""
		}
	}

	/**
	 * Utility static method for boolean evaluation of a single MappedExpression with a corresponding map.
	 * It will return true only if the value found from the mappedKey and is "true" or "1", otherwise
	 * it returns false
	 * @param expression String containing a single MappedExpression
	 * @param map values map to use for processing
	 */
	public static evaluateBoolean(expression: string, map: Map<string, string>): boolean {
		const mapExpRegex = new RegExp(MappedExpression.regex);
		let result: RegExpExecArray = mapExpRegex.exec(expression);
		if (mapExpRegex.lastIndex == 0) {
			throw new Error("Invalid expression '" + expression + "' found trying to evaluate a boolean");
		}
		let expr: MappedExpression = new MappedExpression(result);
		if (expr.$isTernary) {
			throw new Error("Mapped expression has a ternary, this method cannot be used with it");
		}
		let value: any = map.get(expr.$mappedKey);
		if (value != null) {
			if (typeof (value) == "boolean") {
				return expr.$isNegated ? !value : value;
			} else {
				return expr.$isNegated ?
					!(value.toLowerCase() == "true" || value.toLowerCase() == "1") :
					(value.toLowerCase() == "true" || value.toLowerCase() == "1");
			}
		} else {
			return false;
		}
	}

}