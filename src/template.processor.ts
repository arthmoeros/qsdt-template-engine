import { StringContainer, StringHandlerUtil } from "@artifacter/common";

import { SubTemplate } from "./entity/sub-template";
import { ObjectPropertyLocator } from "./locator/object-property-locator";
import { TemplateScanner, ElementMatch } from "./core/template-scanner";
import { MappedExpression } from "./entity/mapped-expression";
import { DeclaredIteration } from "./entity/declared-iteration";
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
 * This is the main class for template processing, it uses a generic object to process the template
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
	 * Constructs a Template Processor with a named string template or null for anonymous template
	 * @param templateName this template name or null for anonymous template
	 * @param stringTmpl string containing template contents
	 * @param optionalityByDefault makes all mapped expressions optional by default
	 */
	constructor(templateName: string, stringTmpl: string, optionalityByDefault?: boolean);

	/**
	 * Construct a Templater Processor with an atmpl file and optional custom pipe functions and custom template functions
	 * @param fileName atmpl file name
	 * @param fileBuffer atmpl Buffer with atmpl contents
	 * @param optionalityByDefault makes all mapped expressions optional by default
	 * @param customPipeFunctions Custom Pipe Functions to use, it must contain methods annotated with @PipeFunction
	 * @param declaredIterationProcessors Custom Declared Iteration Processors to use, these must extend the class DeclaredIterationProcessor
	 */
	constructor(fileName: string, fileBuffer: Buffer, optionalityByDefault?: boolean, customPipeFunctions?: CustomPipeFunctions, declaredIterationProcessors?: DeclaredIterationProcessor[]);

	/**
	 * Construct a Template Processor containing a reference to a Parent Processor, this is meant to be used 
	 * internally for sub-templates such as ForEach sections.
	 * @param parentProcessor Parent Processor for state referencing on this child processor
	 * @param nestedContents Partial template corresponding to the child sub-template
	 */
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
		} else {
			if (typeof (param1) == "string") {
				this.templateName = param1;
			} else {
				this.templateName = "(anonymous template)";
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
	 * Optional Syntax checking, for atmpl files debugging purposes, 
	 * it is not recommended to run on production enviroments.
	 * It returns a string array with any syntax error found or null if it
	 * did not find any problem.
	 */
	public checkSyntax(): string[] {
		let scanner: TemplateScanner = new TemplateScanner(this.templateContents);
		let matches: ElementMatch[] = scanner.run();

		let syntaxErrors: string[] = [];
		this.declaredIterations = []
		matches.forEach(currentMatch => {
			if (currentMatch.type == "mappedExpression") {
				let expr: MappedExpression = new MappedExpression(currentMatch.regex);
				if (expr.$invalidExprMsg != null) {
					syntaxErrors.push(
						"[MappedExpression Error] " +
						expr.$invalidExprMsg.expr +
						"(" + expr.$invalidExprMsg.lineNum +
						":" + expr.$invalidExprMsg.colNum +
						") -> " + expr.$invalidExprMsg.problem
					)
				}
				if (expr.$isIterated) {
					try {
						this.retrieveValueFromIterDec(expr.$mappedKey);
					} catch (error) {
						let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(currentMatch.regex.input, currentMatch.regex.index);
						syntaxErrors.push(
							"[Iterated MappedExpression Error] " +
							currentMatch.regex[0] +
							"(" + lineCol[0] +
							":" + lineCol[1] +
							") -> " + error.message
						)
					}
				}
			} else if (currentMatch.type == "declaredIteration") {
				this.declaredIterations.push(new DeclaredIteration(currentMatch.regex));
			} else if (currentMatch.type == "forEachBlock") {
				let valid: boolean = new RegExp(SubTemplate.validSyntaxForeach).test(currentMatch.regex[0]);
				if (!valid) {
					let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(currentMatch.regex.input, currentMatch.regex.index);
					syntaxErrors.push(
						"[ForEach SubTemplate Error] " +
						currentMatch.regex[0] +
						"(" + lineCol[0] +
						":" + lineCol[1] +
						") -> Has invalid Syntax"
					)
				}
			} else if (currentMatch.type == "presentBlock") {
				let valid: boolean = new RegExp(SubTemplate.validSyntaxPresent).test(currentMatch.regex[0]);
				if (!valid) {
					let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(currentMatch.regex.input, currentMatch.regex.index);
					syntaxErrors.push(
						"[If SubTemplate Error] " +
						currentMatch.regex[0] +
						"(" + lineCol[0] +
						":" + lineCol[1] +
						") -> Has invalid Syntax"
					)
				}
			}
		});
		this.declaredIterations = [];

		let forEachFound: ElementMatch[] = [];
		let presentFound: ElementMatch[] = [];
		let closingAloneFound: ElementMatch[] = [];
		matches.forEach((currentMatch) => {
			if (currentMatch.type == "forEachBlock") {
				forEachFound.push(currentMatch);
			} else if (currentMatch.type == "forEachBlockEnd") {
				if (forEachFound.length == 0) {
					closingAloneFound.push(currentMatch);
				} else {
					forEachFound.pop();
				}
			} else if (currentMatch.type == "presentBlock") {
				presentFound.push(currentMatch);
			} else if (currentMatch.type == "presentBlockEnd") {
				if (presentFound.length == 0) {
					closingAloneFound.push(currentMatch);
				} else {
					presentFound.pop();
				}
			}
		});
		forEachFound.forEach((forEach) => {
			let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(forEach.regex.input, forEach.regex.index);
			syntaxErrors.push(
				"[ForEach SubTemplate Error] " +
				forEach.regex[0] +
				"(" + lineCol[0] +
				":" + lineCol[1] +
				") -> Doesn't have a closing expression"
			)
		});
		presentFound.forEach((ifexpr) => {
			let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(ifexpr.regex.input, ifexpr.regex.index);
			syntaxErrors.push(
				"[If SubTemplate Error] " +
				ifexpr.regex[0] +
				"(" + lineCol[0] +
				":" + lineCol[1] +
				") -> Doesn't have a closing expression"
			)
		});
		closingAloneFound.forEach((closing) => {
			let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(closing.regex.input, closing.regex.index);
			syntaxErrors.push(
				"[SubTemplate Closing Error] " +
				closing.regex[0] +
				"(" + lineCol[0] +
				":" + lineCol[1] +
				") -> Doesn't have a matching opening expression"
			)
		});
		if (syntaxErrors.length == 0) {
			return null;
		}
		return syntaxErrors;
	}

	/**
	 * Sets up Template Parameters for use with parameterized expressions, if the processed
	 * template has parameterized expressions, these parameters must be set before the 
	 * processor is run, otherwise it will raise an error
	 */
	public setTemplateParameters(templateParameters: {}) {
		this.templateParameters = templateParameters;
	}

	/**
	 * Runs the processor and returns the generated artifact.
	 * It has minimun checks but does not check the atmpl syntax correctness fully, 
	 * if it has any problem it will throw an error or it may result in a incorrect artifact, 
	 * if you need to check for syntax correctness it is advised to debug first the atmpl 
	 * file using the #checkSyntax() method.
	 * 
	 * It is backwards compatible with the old #run(Map<string,string>) version (internally converts it
	 * to an object)
	 * 
	 * @param input Input object where to retrieve the data to fill the template.
	 * @param parentInput Required parent object for child processors, internally used for foreach sub-templates
	 * @return Generated artifact
	 */
	public run(input: {}, parentInput?: {}): string {
		if(input instanceof Map){
			let convertedInput: {} = {};
			input.forEach((value, key) =>{
				convertedInput[key] = value;
			});
			input = convertedInput;
		}
		if (this.parentProcessor != null && parentInput == null) {
			throw new Error("This is a nested processor but no parent input was provided");
		}
		let workingResult: StringContainer = new StringContainer(this.templateContents);
		if (this.parentProcessor == null) {
			this.declaredIterationProcessorsMap.initializeProcessors();
		}

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

		// remove all foreachs and if expression blocks
		let forEachRegexStart: RegExp = new RegExp(SubTemplate.regexForEachStart);
		let forEachRegexEnd: RegExp = new RegExp(SubTemplate.regexForEachEnd);
		let presentRegexStart: RegExp = new RegExp(SubTemplate.regexPresentStart);
		let presentRegexEnd: RegExp = new RegExp(SubTemplate.regexPresentEnd);
		while (forEachRegexStart.test(workingResult.toString())) {
			workingResult.replace(forEachRegexStart, "");
		}
		while (forEachRegexEnd.test(workingResult.toString())) {
			workingResult.replace(forEachRegexEnd, "");
		}
		while (presentRegexStart.test(workingResult.toString())) {
			workingResult.replace(presentRegexStart, "");
		}
		while (presentRegexEnd.test(workingResult.toString())) {
			workingResult.replace(presentRegexEnd, "");
		}

		return workingResult.toString();
	}

	/**
	 * Processes an Element Match, it determines which type of element is and works it acordingly
	 * @param currentMatch Current element match to process
	 * @param matches All element matches left to process
	 * @param workingResult StringContainer with the "in work" resulting artifact
	 * @param input input object on this process run
	 * @param parentInput parent input object of this child process run
	 */
	private processMatch(currentMatch: ElementMatch, matches: ElementMatch[], workingResult: StringContainer, input: {}, parentInput?: {}) {
		if (currentMatch.type == "mappedExpression") {
			this.processMappedExpression(currentMatch.regex, workingResult, input, parentInput);
		} else if (currentMatch.type == "declaredIteration") {
			this.processDeclaredIteration(currentMatch.regex);
		} else if (currentMatch.type == "forEachBlock") {
			this.processForEachBlock(currentMatch.regex, matches, workingResult, input, parentInput);
		} else if (currentMatch.type == "presentBlock") {
			this.processPresentBlock(currentMatch.regex, matches, workingResult, input, parentInput);
		}
	}

	/**
	 * Processes a ForEach block, it spawns a child process for its sub-template
	 * 
	 * @param regexec RegExp execution result for a foreach block
	 * @param matches All element matches left to process
	 * @param workingResult StringContainer with the "in work" resulting artifact
	 * @param input input object on this process run
	 * @param parentInput parent input object of this child process run
	 */
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

	/**
	 * Processes an If block, if the element indicated in the expression results in null,
	 * the whole If block is eliminated from the working result
	 * 
	 * @param regexec RegExp execution result for an if block
	 * @param matches All element matches left to process
	 * @param workingResult StringContainer with the "in work" resulting artifact
	 * @param input input object on this process run
	 * @param parentInput parent input object of this child process run
	 */
	private processPresentBlock(regexec: RegExpExecArray, matches: ElementMatch[], workingResult: StringContainer, input: {}, parentInput?: {}) {
		let expr: string = regexec[2];
		if (!SubTemplate.validSyntaxPresent.test(expr)) {
			throw new Error(`Present block has invalid syntax, found: ${regexec[0]}`);
		}
		let startIndex: number = regexec.index;
		let endIndex: number = null;
		let foundValue: any = ObjectPropertyLocator.lookup(input, expr);
		if (parentInput != null && foundValue == null) {
			foundValue = ObjectPropertyLocator.lookup(parentInput, expr);
		}
		if (foundValue == null) {
			let nestedPresentBlocksFound: number = 0;
			while (true) {
				let currentMatch: ElementMatch = matches.shift();
				if (currentMatch == null) {
					throw new Error("Reached the end of matches and didn't find the closing If block");
				}
				if (currentMatch.type == "presentBlock") {
					nestedPresentBlocksFound++;
				}
				if (currentMatch.type == "presentBlockEnd") {
					if (nestedPresentBlocksFound > 0) {
						nestedPresentBlocksFound--;
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

	/**
	 * Adds the found Declared Iteration for any Iterated Mapped Expression use
	 * 
	 * @param regexec RegExp execution result for a Declared Iteration
	 */
	private processDeclaredIteration(regexec: RegExpExecArray) {
		let decIter: DeclaredIteration = new DeclaredIteration(regexec);
		this.declaredIterations.push(decIter);
	}

	/**
	 * Process a Mapped Expression, it has the minimum checks in place
	 * 
	 * @param regexec RegExp execution result for a Mapped Expression
	 * @param workingResult StringContainer with the "in work" resulting artifact
	 * @param input input object on this process run
	 * @param parentInput parent input object of this child process run
	 */
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
	 * @param request values generic object to use for processing
	 */
	public static evaluateBoolean(expression: string, request: {}): boolean {
		const mapExpRegex = new RegExp(MappedExpression.regex);
		let result: RegExpExecArray = mapExpRegex.exec(expression);
		if (mapExpRegex.lastIndex == 0) {
			throw new Error("Invalid expression '" + expression + "' found trying to evaluate a boolean");
		}
		let expr: MappedExpression = new MappedExpression(result);
		if (expr.$isTernary) {
			throw new Error("Mapped expression has a ternary, this method cannot be used with it");
		}
		let value: any = ObjectPropertyLocator.lookup(request, expr.$mappedKey);
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