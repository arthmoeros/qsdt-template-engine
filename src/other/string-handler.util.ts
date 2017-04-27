import { StringContainer } from "./../container/string.container";

export class StringHandlerUtil{
	
	public static convertCamelCaseToDashed(str: string): string {
		let firstPass: RegExp = new RegExp(/([a-z])([A-Z])/g);
		let secondPass: RegExp = new RegExp(/([A-Z])([A-Z])([a-z])/g);
		let result: StringContainer = new StringContainer(str);
		result.replace(firstPass, "$1-$2");
		result.replace(secondPass, "$1-$2$3");
		return result.toString().toLowerCase();
	}

	public static convertToClassName(str: string): string {
		if (str.charAt(0) != str.charAt(0).toUpperCase()) {
			return str.charAt(0).toUpperCase().concat(str.slice(1, str.length));
		} else {
			return str;
		}
	}

	public static locateLineColumnUpToIndex(str: string, index: number) : [number, number] {
		str = str.substring(0, index);
		str = str.replace(/\r/g, "");
		let lines: string[] = str.split("\n");
		let lineNum: number = lines.length;
		let colNum: number = lines[lines.length-1].length;
		return [lineNum, colNum];
	}
}