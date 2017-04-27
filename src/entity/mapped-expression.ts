import { StringHandlerUtil } from "../other/string-handler.util";

export class MappedExpression {

	public static readonly regex: RegExp = /(&{.*?})/g;
	private static readonly groupedRegex: RegExp = /(&{) *(\([a-zA-Z0-9_,]*?\))? *([a-zA-Z0-9_.]*?) *(\?)? *(\"[a-zA-Z0-9_. ]*?\")? *('[a-zA-Z0-9_. ]*?')? *(:)? *(\"[a-zA-Z0-9_. ]*?\")? *('[a-zA-Z0-9_. ]*?')? *(})/g;

	private startIndex: number;
	private endIndex: number;
	private pipeFunctions: string[];
	private mappedKey: string;
	private isTernary: boolean;
	private ternaryTrue: string;
	private ternaryFalse: string;
	private invalidExprMsg: {
		expr: string,
		lineNum: number,
		colNum: number,
		problem: string
	};

	constructor(foundExpr: RegExpExecArray) {
		let capturedGroups: RegExpExecArray = this.checkValidSyntax(foundExpr);
		if (capturedGroups) {
			this.parse(capturedGroups, foundExpr);
			this.checkMissingData(foundExpr);
		}
	}

	private checkValidSyntax(foundExpr: RegExpExecArray): RegExpExecArray {
		let regex: RegExp = new RegExp(MappedExpression.groupedRegex);
		let resultVal = regex.exec(foundExpr[0]);
		if (resultVal == null) {
			let lineCol: [number, number] = StringHandlerUtil.locateLineColumnUpToIndex(foundExpr.input, foundExpr.index);
			this.invalidExprMsg = {expr:foundExpr[0],lineNum:lineCol[0],colNum:lineCol[1],problem:"Invalid Syntax"};
		}
		return resultVal;
	}

	private parse(capturedGroups: RegExpExecArray, foundExpr: RegExpExecArray) {
		if (capturedGroups[2]) {
			this.pipeFunctions = this.parsePipeFunctions(capturedGroups[2]);
		}
		this.mappedKey = capturedGroups[3];
		this.isTernary = capturedGroups[4] == "?";
		if (this.isTernary) {
			this.ternaryTrue = capturedGroups[5];
			if (!this.ternaryTrue) {
				this.ternaryTrue = capturedGroups[6];
			}
			this.ternaryFalse = capturedGroups[8];
			if (!this.ternaryFalse) {
				this.ternaryFalse = capturedGroups[9];
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
			this.invalidExprMsg = {expr:foundExpr[0],lineNum:lineCol[0],colNum:lineCol[1],problem:problem};
		};
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

	public get $invalidExprMsg(): {
	expr: string,
		lineNum: number,
			colNum: number,
				problem: string
} {
	return this.invalidExprMsg;
}
	
}