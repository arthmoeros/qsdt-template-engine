import { DeclaredIteration } from "./../entity/declared-iteration";
import { MappedExpression } from "./../entity/mapped-expression";
import { SubTemplate } from "./../entity/sub-template";

export class TemplateScanner {

    private fileName: string;
    private fileContents: string;

    private currentIndex: number;
    private declaredIterationMatcher: RegExp;
    private mappedExpressionMatcher: RegExp;
    private subtemplateForEachMatcher: RegExp;
    private subtemplateIfMatcher: RegExp;
    private subtemplateForEachEndMatcher: RegExp;
    private subtemplateIfEndMatcher: RegExp;

    private matches: RegexMatch[];

    private declaredIterations: DeclaredIteration[];
    private mappedExpressions: MappedExpression[];
    private subTemplates: SubTemplate[];

    constructor(fileName: string, fileContents: string) {
        this.currentIndex = 0;
        this.fileContents = fileContents;
        this.fileName = fileName;

        this.mappedExpressionMatcher = new RegExp(MappedExpression.regex);
        this.declaredIterationMatcher = new RegExp(DeclaredIteration.regex);
        this.subtemplateForEachMatcher = new RegExp(SubTemplate.regexForEachStart);
        this.subtemplateIfMatcher = new RegExp(SubTemplate.regexIfStart);
        this.subtemplateForEachEndMatcher = new RegExp(SubTemplate.regexForEachEnd);
        this.subtemplateIfEndMatcher = new RegExp(SubTemplate.regexIfEnd);
    }

    public scan() {
        let matches: RegexMatch[] = [];
        while (this.currentIndex < this.fileContents.length) {
            let mappedExpressionMatch: RegExpExecArray = this.mappedExpressionMatcher.exec(this.fileContents);
            let declaredIterationMatch: RegExpExecArray = this.declaredIterationMatcher.exec(this.fileContents);
            let subtemplateForEachMatch: RegExpExecArray = this.subtemplateForEachMatcher.exec(this.fileContents);
            let subtemplateIfMatch: RegExpExecArray = this.subtemplateIfMatcher.exec(this.fileContents);
            let subtemplateForEachEndMatch: RegExpExecArray = this.subtemplateForEachEndMatcher.exec(this.fileContents);
            let subtemplateIfEndMatch: RegExpExecArray = this.subtemplateIfEndMatcher.exec(this.fileContents);

            if (mappedExpressionMatch == null
                && declaredIterationMatch == null
                && subtemplateForEachMatch == null
                && subtemplateIfMatch == null) {
                this.currentIndex = this.fileContents.length;
                continue;
            }

            if (mappedExpressionMatch != null) {
                matches.push(new RegexMatch("mappedExpression", mappedExpressionMatch));
            }
            if (declaredIterationMatch != null) {
                matches.push(new RegexMatch("declaredIteration", declaredIterationMatch));
            }
            if (subtemplateForEachMatch != null) {
                matches.push(new RegexMatch("subtemplateForEach", subtemplateForEachMatch));
            }
            if (subtemplateIfMatch != null) {
                matches.push(new RegexMatch("subtemplateIf", subtemplateIfMatch));
            }
            if (subtemplateForEachEndMatch != null) {
                matches.push(new RegexMatch("subtemplateForEachEnd", subtemplateForEachEndMatch));
            }
            if (subtemplateIfEndMatch != null) {
                matches.push(new RegexMatch("subtemplateIfEnd", subtemplateIfEndMatch));
            }
        }
        //console.log(matches);
        matches.sort(TemplateScanner.sorter);
        matches.forEach(match => {
            console.log("Found a ["+match.type+"] at index ["+match.regex.index+"] it says ["+match.regex[0]+"]");
        });
    }

    private static sorter(exec1: RegexMatch, exec2: RegexMatch): number {
        return exec1.regex.index - exec2.regex.index;
    }
}

class RegexMatch {
    constructor(public type: string, public regex: RegExpExecArray) {
    }
}