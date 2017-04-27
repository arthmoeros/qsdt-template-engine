import * as fs from "fs";
import { MappedExpression } from "./../entity/mapped-expression";
import { StringContainer } from "./string.container";
import { StringHandlerUtil } from "./../other/string-handler.util";

export class TemplateContainer{

	public static readonly msgTmplInvalid: string = "Invalid template?: Couldn't find any matching expression in the template, maybe isn't a valid template or expressions have syntax errors";

	private filename: string;
	private fileContents: string;
	private mapExprList: MappedExpression[] = new Array<MappedExpression>();
	private invalid: boolean = false;
	
	constructor(filename: string){
		this.filename = filename;
		this.fileContents = fs.readFileSync(filename).toString();

		this.initializeExpressions();
		this.checkInvalidExpressions();
	}

	private initializeExpressions(){
		const mapExpRegex = new RegExp(MappedExpression.regex);
		
		while(true){
			let result: RegExpExecArray = mapExpRegex.exec(this.fileContents);
			if(mapExpRegex.lastIndex == 0){
				break;
			}
			this.mapExprList.push(new MappedExpression(result));
		}

		if(this.mapExprList.length == 0){
			this.invalid = true;
			throw new Error(TemplateContainer.msgTmplInvalid);
		}
	}

	private checkInvalidExpressions(){
		let errorsFound: StringContainer = new StringContainer();
		this.mapExprList.forEach(mapExpr => {
			if(mapExpr.$invalidExprMsg){
				errorsFound.concat("\nError at ["
					+mapExpr.$invalidExprMsg.lineNum+","
					+mapExpr.$invalidExprMsg.colNum+"] expr '"
					+mapExpr.$invalidExprMsg.expr+"' -> "
					+mapExpr.$invalidExprMsg.problem);
			}
		});

		if(errorsFound.toString().length > 0){
			throw new SyntaxError("Template '"+this.filename+"' has invalid expressions, details:"+errorsFound.toString()+"\n---");
		}

	}

	public get $filename(): string {
		return this.filename;
	}

	public get $fileContents(): string {
		return this.fileContents;
	}

	public get $mapExprList(): MappedExpression[] {
		return this.mapExprList;
	}

	public get $invalid(): boolean  {
		return this.invalid;
	}
	
}