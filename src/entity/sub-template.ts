export class SubTemplate{

    public static readonly regexForEachStart: RegExp = /(::foreach\()(.*?)(\)::)/g;
    public static readonly regexForEachEnd: RegExp = /::\/foreach::/g;
    public static readonly regexPresentStart: RegExp = /(::present\()(.*?)(\)::)/g;
    public static readonly regexPresentEnd: RegExp = /::\/present::/g;

    public static readonly validSyntaxForeach: RegExp = / *?([A-Za-z0-9]+) +in +([A-Za-z0-9.]+) *?/g;
    public static readonly validSyntaxPresent: RegExp = / *?([A-Za-z0-9.]+) *?/g;
}