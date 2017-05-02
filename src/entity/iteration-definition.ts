/**
 * @class IterationDefinition
 * @version 0.9.0
 * @see npm @ab/template-processor
 * @see also README.md of this project for an explanation about abtmpl files
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This Class defines an iteration definition, which are recognized within Artifact Builder's template
 * engine, it is required for iterated mapped expressions to work, it defines the mappedKey to be used
 * on the iterated mapped expressions and the function associated with it to retrieve the values to
 * replace the expressions with.
 * 
 */
export class IterationDefinition{

    /**
     * Regex for recognition and grouping of an Iteration Definition
     */
    public static readonly regex: RegExp = /(#iteration\()([a-zA-Z0-9_.]*?)(=)([a-zA-Z0-9_.]*?)(\))\n?(\r\n)?/g;

    /**
     * MappedKey to be used on its associated iterated mapped expressions
     */
    private mappedKey: string;

    /**
     * Function name to be executed for each iterated mapped expression
     */
    private mappedFunction: string;

    /**
     * Constructs an instance of this class with a found Iteration Definition
     * @param capturedGroups regex exec result from a found Iteration Definition
     */
    constructor(capturedGroups: RegExpExecArray){
        this.mappedKey = capturedGroups[2];
        this.mappedFunction = capturedGroups[4];
    }

    public get $mappedKey(): string{
        return this.mappedKey;
    }

    public get $mappedFunction(): string{
        return this.mappedFunction;
    }
}