export class RegexContainer{
	private innerRegex: RegExp;

	constructor(regex: RegExp){
		this.innerRegex = regex;
	}

	public search(str: string): string[]{
		this.innerRegex.lastIndex = 0;
		return this.innerRegex.exec(str);
	}

	public get regex(): RegExp{
		return this.innerRegex;
	}
}