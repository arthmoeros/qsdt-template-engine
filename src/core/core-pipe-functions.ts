import { StringHandlerUtil, PipeFunction } from "@artifacter/common";

/**
 * @class CorePipeFunctions
 * @see npm @artifacter/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
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
		str = str.toUpperCase();
		return str;
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
	 * Invokes StringHandlerUtil#convertCamelCaseToDashed
	 * @param str 
	 */
	@PipeFunction()
	public cc2dashed(str: string): string {
		return StringHandlerUtil.convertCamelCaseToDashed(str);
	}

}