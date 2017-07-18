export class SubTemplate{

    public static readonly regexForEachStart: RegExp = /(::foreach\()(.*?)(\)::)/g;
    public static readonly regexForEachEnd: RegExp = /::\/foreach::/g;
    public static readonly regexIfStart: RegExp = /(::if\()(.*?)(\)::)/g;
    public static readonly regexIfEnd: RegExp = /::\/if::/g;

    public static readonly validSyntaxForeach: RegExp = / *?([A-Za-z0-9]+) +in +([A-Za-z0-9.]+) *?/g;
    public static readonly validSyntaxIf: RegExp = / *?([A-Za-z0-9.]+) *?/g;
}