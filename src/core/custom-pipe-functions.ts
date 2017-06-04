/**
 * @class CustomPipeFunctions
 * Manages Custom Pipe Functions, these must have the following contract:
 * 
 * #customPipefunction(value: string, ...args: string[]): string
 * 
 */
export class CustomPipeFunctions {
    private functions: any = {};

    /**
     * Adds a pipe function to the stack of available Custom Pipe Functions
     * 
     * @param functionName name of the function, must match the one used on a template
     * @param closure the function itself, must follow the specified contract
     */
    public addFunction(functionName: string, closure: (value: string, ...args: string[]) => string): CustomPipeFunctions {
        this.functions[functionName] = closure;
        return this;
    }

    /**
     * Invokes an available pipe function, meant to be used by the pipe functions processor
     * 
     * @param functionName name of the function
     * @param inputValue input value to process
     * @param parameters additional parameters if any
     */
    public invoke(functionName: string, inputValue: string, parameters?: string[]): string {
        if(this.functions[functionName] == null){
            throw new Error("Unknown Custom Pipe Function requested: "+functionName+"("+inputValue+(parameters != null ? ","+parameters+")": ")"));
        }
        let func: Function = this.functions[functionName];
        let args: string[] = [inputValue];
        if(parameters != null){
            args = args.concat(parameters);
        }
        return func.apply(null, args);
    }
}