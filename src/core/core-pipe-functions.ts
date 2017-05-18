import { StringHandlerUtil, PipeFunction, StringContainer } from "@artifacter/common";

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


	/**
	 * All Upper Case
	 * @param str 
	 */
	@PipeFunction()
	public auc(str: string): string {
		str = str.toUpperCase();
		return str;
	}

	/**
	 * All Lower Case
	 * @param str 
	 */
	@PipeFunction()
	public alc(str: string): string {
		str = str.toLowerCase();
		return str;
	}

	/**
	 * Starts with Upper Case
	 */
	@PipeFunction()
	public suc(str: string): string {
		if (str == "") {
			return "";
		} else if (str.length == 1) {
			return str.toUpperCase();
		} else {
			return str.charAt(0).toUpperCase() + str.substr(1);
		}
	}

	/**
	 * Starts with Lower Case
	 */
	@PipeFunction()
	public slc(str: string): string {
		if (str == "") {
			return "";
		} else if (str.length == 1) {
			return str.toLowerCase();
		} else {
			return str.charAt(0).toLowerCase() + str.substr(1);
		}
	}

	/**
	 * Fills a number string zero-padding the left until its
	 * length reaches 6.
	 * TODO: When pipe-functions engine is improved to support parameters, switch this function to
	 * support an additional length argument
	 * @param str 
	 */
	@PipeFunction()
	public sixPaddLeftZero(str: string): string {
		if (str.length >= 6) {
			return str.substr(str.length - 6, 6);
		} else {
			var remaining = 6 - str.length;
			var zeroes = "";
			for (var index = 0; index < remaining; index++) {
				zeroes = zeroes.concat("0");
			}
			return zeroes.concat(str);
		}
	}

	/**
	 * Prefixes the string with an underscore
	 * TODO: When pipe-functions engine is improved to support parameters, switch this function to
	 * support an additional prefix string argument
	 * @param str 
	 */
	@PipeFunction()
	public prefixUnderscore(str: string): string {
		if (str == "") {
			return "";
		} else {
			return "_" + str;
		}
	}

	/**
	 * Prefixes the string with a forward slash
	 * TODO: When pipe-functions engine is improved to support parameters, switch this function to
	 * support an additional prefix string argument
	 * @param str
	 */
	@PipeFunction()
	public prefixFwdSlash(str: string): string {
		if (str == "") {
			return "";
		} else {
			return "/" + str;
		}
	}

	/**
	 * Prefixes the string with a dot
	 * TODO: When pipe-functions engine is improved to support parameters, switch this function to
	 * support an additional prefix string argument
	 * @param str
	 */
	@PipeFunction()
	public prefixDot(str: string): string {
		if (str == "") {
			return "";
		} else {
			return "." + str;
		}
	}

	/**
	 * Underscore Replaces Dot
	 * Replaces all dots with an underscore
	 * TODO: When pipe-functions engine is improved to support parameters, switch this function to
	 * a more generic string search and replace function
	 */
	@PipeFunction()
	public urd(str: string): string {
		return new StringContainer(str).replaceAll(".", "_").toString();
	}

	/**
	 * Invokes StringHandlerUtil#convertCamelCaseToDashed
	 * @param str 
	 */
	@PipeFunction()
	public cc2dashed(str: string): string {
		return StringHandlerUtil.convertCamelCaseToDashed(str);
	}

}