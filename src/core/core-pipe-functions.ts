import { StringHandlerUtil, StringContainer } from "@artifacter/common";

/**
 * @class CorePipeFunctions
 * @see npm @artifacter/template-engine
 * @see also README.md of this project for an explanation about atmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class defines core pipe functions to use with templates, these should be
 * commonly used, if you want to suggest an additional function that would be common,
 * you may make a pull request o an issue requesting the enhancement
 * 
 */
export class CorePipeFunctions {

	private coreAUC = (str: string): string => {
		str = str.toUpperCase();
		return str;
	};
	private coreALC = (str: string): string => {
		str = str.toLowerCase();
		return str;
	};
	private coreSUC = (str: string): string => {
		if (str == "") {
			return "";
		} else if (str.length == 1) {
			return str.toUpperCase();
		} else {
			return str.charAt(0).toUpperCase() + str.substr(1);
		}
	};
	private coreSLC = (str: string): string => {
		if (str == "") {
			return "";
		} else if (str.length == 1) {
			return str.toLowerCase();
		} else {
			return str.charAt(0).toLowerCase() + str.substr(1);
		}
	};
	private corePaddLeft = (str: string, repstr: string, char: string): string => {
		var rep = parseInt(repstr);
		if (str.length >= rep) {
			return str.substr(str.length - rep, rep);
		} else {
			var remaining = rep - str.length;
			var chars = "";
			for (var index = 0; index < remaining; index++) {
				chars = chars.concat(char);
			}
			return chars.concat(str);
		}
	};
	private corePrefix = (str: string, prefix: string): string => {
		if (str == "") {
			return "";
		} else {
			return prefix + str;
		}
	};
	private coreReplace = (str: string, find: string, repl: string): string => {
		return new StringContainer(str).replaceAll(find, repl).toString();
	};
	private coreCC2Dashed = (str: string): string => {
		return StringHandlerUtil.convertCamelCaseToDashed(str);
	};

    private coreBlanksToCamelCase = (str: string): string => {
        let words: string[] = str.split(" ");
        if (words.length <= 1) {
            return str;
        } else {
            let camelCase: StringContainer = new StringContainer();
            let firstLoop: boolean = true;
            words.forEach(word => {
                if (firstLoop) {
                    camelCase.append(word);
                    firstLoop = false;
                } else {
                    camelCase.append(this.coreSUC(word));
                }
            });
            return camelCase.toString();
        }
    };

	/**
	 * All Upper Case
	 * @param str 
	 */
	public get auc(): (value: string, ...args: string[]) => string {
		return this.coreAUC;
	}

	/**
	 * All Lower Case
	 * @param str 
	 */
	public get alc(): (value: string, ...args: string[]) => string {
		return this.coreALC;
	}

	/**
	 * Starts with Upper Case
	 */
	public get suc(): (value: string, ...args: string[]) => string {
		return this.coreSUC;
	}

	/**
	 * Starts with Lower Case
	 */
	public get slc(): (value: string, ...args: string[]) => string {
		return this.coreSLC;
	}

	/**
	 * Fills a string with a specified character to the left until its
	 * length reaches the specified length.
	 * @param str 
	 */
	public get paddLeft(): (value: string, ...args: string[]) => string {
		return this.corePaddLeft;
	}

	/**
	 * Prefixes the string with a specific character
	 * @param str 
	 */
	public get prefix(): (value: string, ...args: string[]) => string {
		return this.corePrefix;
	}

	/**
	 * Replaces the found string with the replacement one, in the specified string
	 */
	public get replace(): (value: string, ...args: string[]) => string {
		return this.coreReplace;
	}

	/**
	 * Invokes StringHandlerUtil#convertCamelCaseToDashed
	 * @param str 
	 */
	public get cc2dashed(): (value: string, ...args: string[]) => string {
		return this.coreCC2Dashed;
	}

	/**
	 * Converts a blank space separated words string to a camel case
	 * @param str 
	 */
	public get blanks2cc(): (value: string, ...args: string[]) => string {
		return this.coreBlanksToCamelCase;
	}

}