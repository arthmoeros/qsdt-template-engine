import * as replaceAll from "replaceall";

export class StringContainer{
	private containedString: string;

	constructor(initial?: string){
		if(initial){
			this.containedString = initial;
		}else{
			this.containedString = "";
		}
	}

	public concat(str: string|StringContainer){
		if(str instanceof StringContainer){
			str = str.getString();
		}
		this.containedString = this.containedString.concat(str);
	}
	
	public insert(str: string|StringContainer, index: number) {
		if(str instanceof StringContainer){
			str = str.getString();
		}
    	if(index > 0){
			this.containedString = this.containedString.replace(new RegExp('.{' + index + '}'), '$&' + str);
		}else{
			this.containedString = str.concat(this.containedString);
		}
			
	}

	public replace(find: any, replace: string|StringContainer): StringContainer{
		if(replace instanceof StringContainer){
			replace = replace.getString();
		}
		if(find instanceof StringContainer){
			find = find.getString();
		}
		this.containedString = this.containedString.replace(find, replace);
		return this;
	}

	public replaceRange(start: number, end: number, value: string|StringContainer): StringContainer{
		if(value instanceof StringContainer){
			value = value.getString();
		}
		this.containedString = this.containedString.substr(0,start) + value + this.containedString.substr(end, this.containedString.length);
		return this;
	}

	public replaceAll(find: string, replace: string): StringContainer{
		this.containedString = replaceAll(find,replace,this.containedString);
		return this;
	}

	public getString(): string{
		return this.containedString;
	}

	public toString(): string{
		return this.containedString;
	}
	
}