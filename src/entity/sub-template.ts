import { MappedExpression } from "./mapped-expression";

export class SubTemplate{

    public static readonly regexForEachStart: RegExp = /(::foreach\()(.*?)(\)::)/g;
    public static readonly regexForEachEnd: RegExp = /::\/foreach::/g;
    public static readonly regexIfStart: RegExp = /(::if\()(.*?)(\)::)/g;
    public static readonly regexIfEnd: RegExp = /::\/if::/g;

    public static readonly validSyntaxForeach: RegExp = / *?([A-Za-z0-9]+) +as +([A-Za-z0-9.]+) *?/g;
    public static readonly validSyntaxIf: RegExp = / *?([A-Za-z0-9.]+) *?/g;

    private static readonly typeForEach: string = "foreach";
    private static readonly typeIf: string = "if";
    
    private startIndex: number;
    private endIndex: number;
    private type: string;
    private expression: string;
    private foreachItem: any;

    private mappedExpressions: MappedExpression[];

    private children: SubTemplate[];
    


}