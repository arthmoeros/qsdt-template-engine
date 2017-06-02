export class CustomPipeFunctions {
    private functions: any = {};

    public addFunction(functionName: string, closure: (value: string, ...args: string[]) => string): CustomPipeFunctions {
        this.functions[functionName] = closure;
        return this;
    }

    public invoke(functionName: string, inputValue: string, parameters: string[]): string {
        if(this.functions[functionName] == null){
            throw new Error("Unknown Custom Pipe Function requested: "+functionName+"("+inputValue+","+parameters+")");
        }
        let func: Function = this.functions[functionName];
        let args: string[] = new Array<string>();
        args.push(inputValue);
        args = args.concat(parameters);
        return func.apply(null, args);
    }
}