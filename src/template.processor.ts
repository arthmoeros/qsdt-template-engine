import { MappedExpression } from "./entity/mapped-expression";
import { TemplateContainer } from "./container/template.container";
import { StringContainer } from "./container/string.container";
import { PipeFunctionsProcessor } from "./pipe-functions.processor";

const subTmplReged = new RegExp(/(::)*([a-zA-Z0-9_./]*?)*(::)/g);
export class TemplateProcessor{

	private abtmplContainer: TemplateContainer;

	constructor(abtmplFilename: string){
		this.abtmplContainer = new TemplateContainer(abtmplFilename);
	}

	public run(map: Map<string, string>): string{
		if(this.abtmplContainer.$invalid){
			throw new Error(TemplateContainer.msgTmplInvalid);
		}
		if(map.size == 0){
			throw new Error("Invalid Values Map: map is empty");
		}
		let workingResult: StringContainer = new StringContainer(this.abtmplContainer.$fileContents);
		for (var index = (this.abtmplContainer.$mapExprList.length-1); index > -1; index--) {
			var mapExpr = this.abtmplContainer.$mapExprList[index];
			let mappedValue: string = map.get(mapExpr.$mappedKey);
			if(mappedValue == undefined){
				console.warn("Expected key '"+mapExpr.$mappedKey+"', but provided map doesn't have a value associated with it, expect an invalid generated artifact from template located in '"+this.abtmplContainer.$filename+"'");
			}else{
				if(mapExpr.$isTernary){
					mappedValue = mappedValue != "" ? mapExpr.$ternaryTrue : mapExpr.$ternaryFalse ? mapExpr.$ternaryFalse : "";
				}
				if(mapExpr.$pipeFunctions && mapExpr.$pipeFunctions.length > 0){
					mappedValue = PipeFunctionsProcessor.invoke(mapExpr.$pipeFunctions, mappedValue);
				}
				workingResult.replaceRange(mapExpr.$startIndex, mapExpr.$endIndex, mappedValue);
			}
		};

		return workingResult.toString();
	}

}