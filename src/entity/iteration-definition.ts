export class IterationDefinition{

    public static readonly regex: RegExp = /(#iteration\()([a-zA-Z0-9_.]*?)(=)([a-zA-Z0-9_.]*?)(\))\n?(\r\n)?/g;

    private mappedKey: string;
    private mappedFunction: string;

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