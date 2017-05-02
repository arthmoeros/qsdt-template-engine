import { StringHandlerUtil } from "../other/string-handler.util";

export class MappedExpression {

	public static readonly regex: RegExp = /(&{.*?})/g;
	private static readonly groupedRegex: RegExp = /(&{)(\*)? *(\([a-zA-Z0-9_,]*?\))? *([a-zA-Z0-9_.]*?) *(\?)? *(\"[a-zA-Z0-9_. ]*?\")? *('[a-zA-Z0-9_. ]*?')? *(:)? *(\"[a-zA-Z0-9_. ]*?\")? *('[a-zA-Z0-9_. ]*?')? *(})/g;
	private static readonly iteratedRegex: RegExp = /(&{#)([a-zA-Z0-9_.]*?)(})/g;

	private startIndex: number;
	private endIndex: number;
	private pipeFunctions: string[];
	private mappedKey: string;
	private isTernary: boolean;
	private ternaryTrue: string;
	private ternaryFalse: string;
	private isOptional: boolean = false;
	private isIterated: boolean;
	private invalidExprMsg: {
		expr: string,
		lineNum: number,
		colNum: number,
		problem: string
	};

	constructor(foundExpr: RegExpExecArray) {
		let capturedGroups: RegExpExecArray = this.checkValidSyntax(foundExpr);
		if (capturedGroups) {
			if (this.isIterated) {
				this.parseIteratedExpr(capturedGroups, foundExpr);
			} else {
				this.parseNormalExpr(capturedGroups, foundExpr);
			}
			this.checkMissingData(foundExpr);
		}
	}

	private checkValidSyntax(foundExpr: RegExpExecArray): RegExpExecArray {
		let regex: RegExp = new RegExp(MappedExpression.groupedRegex);
		let resultVal = regex.exec(foundExpr[0]);
		if (resultVal == null) {
			regex = new RegExp(MappedExpression.iteratedRegex);
			resultVal = regex.exec(foundExpr[0]);
			if (resultVal == null) {
				let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(foundExpr.input, foundExpr.index);
				this.invalidExprMsg = { expr: foundExpr[0], lineNum: lineCol[0], colNum: lineCol[1], problem: "Invalid Syntax" };
			} else {
				this.isIterated = true;
			}
		} else {
			this.isIterated = false;
		}
		return resultVal;
	}

	private parseNormalExpr(capturedGroups: RegExpExecArray, foundExpr: RegExpExecArray) {
		if (capturedGroups[2]) {
			this.isOptional = true;
		}
		if (capturedGroups[3]) {
			this.pipeFunctions = this.parsePipeFunctions(capturedGroups[3]);
		}
		this.mappedKey = capturedGroups[4];
		this.isTernary = capturedGroups[5] == "?";
		if (this.isTernary) {
			this.ternaryTrue = capturedGroups[6];
			if (!this.ternaryTrue) {
				this.ternaryTrue = capturedGroups[7];
			}
			this.ternaryFalse = capturedGroups[9];
			if (!this.ternaryFalse) {
				this.ternaryFalse = capturedGroups[10];
			}
			if (this.ternaryTrue) {
				this.ternaryTrue = this.ternaryTrue.substring(1, this.ternaryTrue.length - 1);
			}
			if (this.ternaryFalse) {
				this.ternaryFalse = this.ternaryFalse.substring(1, this.ternaryFalse.length - 1);
			}
		}
		this.startIndex = foundExpr.index;
		this.endIndex = this.startIndex + foundExpr[0].length;
	}

	private parseIteratedExpr(capturedGroups: RegExpExecArray, foundExpr: RegExpExecArray) {
		this.mappedKey = capturedGroups[2];
		this.startIndex = foundExpr.index;
		this.endIndex = this.startIndex + foundExpr[0].length;
	}

	private getIterationNumber(capture: string): number {
		return parseInt(capture.substring(1, capture.length - 1));
	}

	private parsePipeFunctions(functions: string): string[] {
		return functions.substring(1, functions.length - 1).split(",");
	}

	private checkMissingData(foundExpr: RegExpExecArray) {
		let problem: string;
		if (!this.mappedKey) {
			problem = "Didn't find a mappedKey in the mapped expression";
		}
		if (this.isTernary && !this.ternaryTrue) {
			problem = "Mapped expression declares a ternary operator but couldn't find resulting value for true outcome";
		}
		if (problem != undefined) {
			let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(foundExpr.input, foundExpr.index);
			this.invalidExprMsg = { expr: foundExpr[0], lineNum: lineCol[0], colNum: lineCol[1], problem: problem };
		};
	}

	public static compareExpr(expr1: MappedExpression, expr2: MappedExpression): number {
		if (expr1.$startIndex < expr2.$startIndex) {
			return -1;
		}
		if (expr1.$startIndex > expr2.$startIndex) {
			return 1;
		}
		return 0;
	}

	public get $startIndex(): number {
		return this.startIndex;
	}

	public get $endIndex(): number {
		return this.endIndex;
	}

	public get $pipeFunctions(): string[] {
		return this.pipeFunctions;
	}

	public get $mappedKey(): string {
		return this.mappedKey;
	}

	public get $isTernary(): boolean {
		return this.isTernary;
	}

	public get $ternaryTrue(): string {
		return this.ternaryTrue;
	}

	public get $ternaryFalse(): string {
		return this.ternaryFalse;
	}

	public get $isIterated(): boolean {
		return this.isIterated;
	}

	public get $isOptional(): boolean {
		return this.isOptional;
	}




	public get $invalidExprMsg(): {
		expr: string,
		lineNum: number,
		colNum: number,
		problem: string
	} {
		return this.invalidExprMsg;
	}

}