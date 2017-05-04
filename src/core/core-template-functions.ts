import { TemplateFunction } from "@artifacter/common";

import { Osb11gGuidGenerator } from "./osb11g/osb11g-guid-generator";

/**
 * @class CoreTemplateFunctions
 * @see npm @artifacter/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class defines core template functions to use with templates, these should be
 * commonly used but can be technology/framework/engine specific, if you want to suggest 
 * an additional function that would be common, you may make a pull request o an issue 
 * (enahancement) request.
 * 
 */
export class CoreTemplateFunctions {

    private static readonly osb11gGuidGenerator: Osb11gGuidGenerator = new Osb11gGuidGenerator();

    /**
     * Generates a GUID for OSB 11g proxies actionIds identifiers
     */
    @TemplateFunction()
    public generateOsb11gGUID(){
        return CoreTemplateFunctions.osb11gGuidGenerator.generateOsb11gGUID();
    }
}