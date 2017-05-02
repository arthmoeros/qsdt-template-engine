import * as fs from "fs";
import { IterationDefinition } from "./../entity/iteration-definition";
import { MappedExpression } from "./../entity/mapped-expression";
import { StringContainer } from "./string.container";
import { StringHandlerUtil } from "./../other/string-handler.util";

export class TemplateContainer{

	public static readonly msgTmplInvalid: string = "Invalid template?: Couldn't find any matching expression in the template, maybe isn't a valid template or expressions have syntax errors";
	public static readonly msgIterInvalid: string = "Invalid iterated mapped expressions!: Found iterated mapped expression(s), but couldn't find an Iteration Definition";

	private filename: string;
	private fileContents: string;
	private mapExprList: MappedExpression[] = new Array<MappedExpression>();
	private normalMapExprList: MappedExpression[] = new Array<MappedExpression>();
	private iterMapExprList: MappedExpression[] = new Array<MappedExpression>();
	private iterDefList: IterationDefinition[] = new Array<IterationDefinition>();
	private invalid: boolean = false;
	private anonymous: boolean = false;

	constructor(stringTmpl: string);

	constructor(fileName: string, fileBuffer: Buffer);
	
	constructor(param1: string, param2?: Buffer){
		if(param2 != null){
			this.filename = param1;
			this.fileContents = param2.toString();
		}else{
			this.filename = "(anonymous template)";
			this.fileContents = param1;
			this.anonymous = true;
		}

		this.initializeExpressions();
		this.checkInvalidExpressions();
		this.checkIterationDef();
		this.joinMappedExpressions();
	}

	private initializeExpressions(){
		const mapExpRegex = new RegExp(MappedExpression.regex);
		
		while(true){
			let result: RegExpExecArray = mapExpRegex.exec(this.fileContents);
			if(mapExpRegex.lastIndex == 0){
				break;
			}
			let expr: MappedExpression = new MappedExpression(result);
			if(expr.$isIterated){
				this.iterMapExprList.push(expr);
			}else{
				this.normalMapExprList.push(expr);
			}
		}

		if(this.normalMapExprList.length == 0 && this.iterMapExprList.length == 0){
			this.invalid = true;
			if(this.anonymous){
				throw new Error(TemplateContainer.msgTmplInvalid + "; Anonymous template contents: " + this.fileContents);
			}else{
				throw new Error(TemplateContainer.msgTmplInvalid + "; Template filename: " + this.filename);
			}
			
		}
	}

	private checkInvalidExpressions(){
		let errorsFound: StringContainer = new StringContainer();
		this.normalMapExprList.forEach(mapExpr => {
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

	private checkIterationDef() {
		const iterDefRegex = new RegExp(IterationDefinition.regex);
		
		while(true){
			let result: RegExpExecArray = iterDefRegex.exec(this.fileContents);
			if(iterDefRegex.lastIndex == 0){
				break;
			}
			let def: IterationDefinition = new IterationDefinition(result);
			this.iterDefList.push(def);
		}

		if(this.iterDefList.length == 0 && this.iterMapExprList.length > 0){
			this.invalid = true;
			throw new Error(TemplateContainer.msgIterInvalid);
		}

		this.iterMapExprList.forEach(iterMapExpr => {
			let iterMapExprKey : string = iterMapExpr.$mappedKey;
			let defMissing: boolean = true;
			this.iterDefList.forEach(iterDef => {
				if(iterDef.$mappedKey == iterMapExpr.$mappedKey){
					defMissing = false;
					return;
				}
			});
			if(defMissing){
				this.invalid = true;
				throw new Error("Iterated mapped expression references '"+iterMapExpr.$mappedKey+"', but couldn't find a matching Iteration Definition");
			}
		});
	}

	public joinMappedExpressions(){
		this.mapExprList = this.normalMapExprList.concat(this.iterMapExprList);
		this.mapExprList = this.mapExprList.sort(MappedExpression.compareExpr);
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

	public get $iterDefList(): IterationDefinition[] {
		return this.iterDefList;
	}

	public get $invalid(): boolean  {
		return this.invalid;
	}
	
}