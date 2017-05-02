import { StringContainer, StringHandlerUtil } from "@ab/common";
import * as fs from "fs";

import { IterationDefinition } from "./../entity/iteration-definition";
import { MappedExpression } from "./../entity/mapped-expression";

/**
 * @class TemplateContainer
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class defines an abtmpl file container, which are recognized within Artifact Builder's template
 * engine, its definition is used by the template processor, it contains everything associated with a
 * abtmpl processed file, its found mapped expressions, iteration definitions, the file's name and contents.
 * 
 * Also works with "anonymous" templates, which are abtmpl not necessarily bound to a real file,
 * like a string used to write a real file name.
 * 
 * It does additional syntax checking and consistency validations.
 * 
 */
export class TemplateContainer{

	public static readonly msgTmplInvalid: string = "Invalid template?: Couldn't find any matching expression in the template, maybe isn't a valid template or expressions have syntax errors";
	public static readonly msgIterInvalid: string = "Invalid iterated mapped expressions!: Found iterated mapped expression(s), but couldn't find an Iteration Definition";

	/**
	 * Associated abtmpl file name, null if it is an anonymous template
	 */
	private filename: string;

	/**
	 * Associated abtmpl file contents or a plain template string for an anonymous template
	 */
	private fileContents: string;

	/**
	 * Consolidates all mapped expressions found in the template
	 */
	private mapExprList: MappedExpression[] = new Array<MappedExpression>();

	/**
	 * Lists only normal mapped expressions
	 */
	private normalMapExprList: MappedExpression[] = new Array<MappedExpression>();

	/**
	 * Lists only iterated mapped expressions
	 */
	private iterMapExprList: MappedExpression[] = new Array<MappedExpression>();

	/**
	 * Lists Iteration Definitions found in the template
	 */
	private iterDefList: IterationDefinition[] = new Array<IterationDefinition>();

	/**
	 * Flags the template as invalid
	 */
	private invalid: boolean = false;

	/**
	 * Determines if this is an anonymous template
	 */
	private anonymous: boolean = false;

	/**
	 * Constructs a TemplateContainer for an anonymous template
	 * @param stringTmpl string containing the template contents
	 */
	constructor(stringTmpl: string);

	/**
	 * Constructs a TemplateContainer for an abtmpl template file
	 * @param fileName abtmpl file name
	 * @param fileBuffer abtmpl buffer containing the file contents
	 */
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

	/**
	 * Initializes all potential mapped expressions found in the template, it will recognize
	 * normal and iterated ones and organize them as such. If it doesn't find any expressions
	 * it will throw an error because it is pointless to process a template without recognizable 
	 * expressions
	 */
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

	/**
	 * Checks for invalid expressions found and reports them with their stored detail for debugging purposes
	 */
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

	/**
	 * Checks for Iteration Definitions presence in the template only if it found iterated mapped expressions.
	 * Also checks if all iterated mapped expressions found have a corresponding Iteration Definition
	 */
	private checkIterationDef() {
		if(this.iterMapExprList.length == 0){
			return;
		}
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

	/**
	 * Consolidates normal and iterated expressions in a single list sorted by starting found index in the template
	 */
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