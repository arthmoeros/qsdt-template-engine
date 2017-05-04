import { DefinitionFunction } from "@ab/common";

import { Osb11gGuidGenerator } from "./osb11g/osb11g-guid-generator";

/**
 * @class CoreDefinitionFunctions
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class defines core definition functions to use with templates, these should be
 * commonly used, if you want to suggest an additional function that would be common,
 * you may make a pull request o an issue requesting the enhancement.
 * 
 */
export class CoreDefinitionFunctions {

    private static readonly osb11gGuidGenerator: Osb11gGuidGenerator = new Osb11gGuidGenerator();

    /**
     * Generates a GUID for OSB 11g proxies actionIds identifiers
     */
    @DefinitionFunction()
    public generateOsb11gGUID(){
        return CoreDefinitionFunctions.osb11gGuidGenerator.generateOsb11gGUID();
    }
}