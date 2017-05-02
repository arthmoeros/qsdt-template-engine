import { MappedExpression } from "./entity/mapped-expression";
import { IterationDefinition } from "./entity/iteration-definition";
import { TemplateContainer } from "./container/template.container";
import { StringContainer } from "./container/string.container";
import { PipeFunctionsProcessor } from "./pipe-functions.processor";
import { DefFunctionsProcessor } from "./def-functions.processor";

const subTmplReged = new RegExp(/(::)*([a-zA-Z0-9_./]*?)*(::)/g);
export class TemplateProcessor {

	private abtmplContainer: TemplateContainer;

	constructor(stringTmpl: string);

	constructor(fileName: string, fileBuffer: Buffer);

	constructor(param1: string, param2?: Buffer) {
		this.abtmplContainer = new TemplateContainer(param1, param2);
	}

	public run(map: Map<string, string>): string {
		if (this.abtmplContainer.$invalid) {
			throw new Error(TemplateContainer.msgTmplInvalid);
		}
		if (map.size == 0) {
			throw new Error("Invalid Values Map: map is empty");
		}
		this.abtmplContainer.joinMappedExpressions();
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