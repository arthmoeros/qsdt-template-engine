import { DeclaredIteration } from "./../entity/declared-iteration";
import { MappedExpression } from "./../entity/mapped-expression";
import { SubTemplate } from "./../entity/sub-template";

export class TemplateScanner {

    private contents: string;

    private declaredIterationMatcher: RegExp;
    private mappedExpressionMatcher: RegExp;
    private subtemplateForEachStartMatcher: RegExp;
    private subtemplateForEachEndMatcher: RegExp;
    private subtemplateIfStartMatcher: RegExp;
    private subtemplateIfEndMatcher: RegExp;

    private declaredIterationMatchDone: boolean = false;
    private mappedExpressionMatchDone: boolean = false;
    private subtemplateForEachStartMatchDone: boolean = false;
    private subtemplateIfStartMatchDone: boolean = false;
    private subtemplateForEachEndMatchDone: boolean = false;
    private subtemplateIfEndMatchDone: boolean = false;

    private matches: ElementMatch[];

    constructor(contents: string) {
        this.contents = contents;

        this.mappedExpressionMatcher = new RegExp(MappedExpression.regex);
        this.declaredIterationMatcher = new RegExp(DeclaredIteration.regex);
        this.subtemplateForEachStartMatcher = new RegExp(SubTemplate.regexForEachStart);
        this.subtemplateForEachEndMatcher = new RegExp(SubTemplate.regexForEachEnd);
        this.subtemplateIfStartMatcher = new RegExp(SubTemplate.regexIfStart);
        this.subtemplateIfEndMatcher = new RegExp(SubTemplate.regexIfEnd);
    }

    public run() : ElementMatch[] {
        let matches: ElementMatch[] = [];
        while (true) {
            let mappedExpressionMatch: RegExpExecArray = null;
            let declaredIterationMatch: RegExpExecArray = null;
            let subtemplateForEachStartMatch: RegExpExecArray = null;
            let subtemplateIfStartMatch: RegExpExecArray = null;
            let subtemplateForEachEndMatch: RegExpExecArray = null;
            let subtemplateIfEndMatch: RegExpExecArray = null;
            if(!this.mappedExpressionMatchDone)
                mappedExpressionMatch = this.mappedExpressionMatcher.exec(this.contents);
            if(!this.declaredIterationMatchDone)
                declaredIterationMatch =this.declaredIterationMatcher.exec(this.contents);
            if(!this.subtemplateForEachStartMatchDone)
                subtemplateForEachStartMatch =this.subtemplateForEachStartMatcher.exec(this.contents);
            if(!this.subtemplateIfStartMatchDone)
                subtemplateIfStartMatch =this.subtemplateIfStartMatcher.exec(this.contents);
            if(!this.subtemplateForEachEndMatchDone)
                subtemplateForEachEndMatch =this.subtemplateForEachEndMatcher.exec(this.contents);
            if(!this.subtemplateIfEndMatchDone)
                subtemplateIfEndMatch =this.subtemplateIfEndMatcher.exec(this.contents);

            if (mappedExpressionMatch == null) this.mappedExpressionMatchDone = true;
            if (declaredIterationMatch == null) this.declaredIterationMatchDone = true;
            if (subtemplateForEachStartMatch == null) this.subtemplateForEachStartMatchDone = true;
            if (subtemplateIfStartMatch == null) this.subtemplateIfStartMatchDone = true;
            if (subtemplateForEachEndMatch == null) this.subtemplateForEachEndMatchDone = true;
            if (subtemplateIfEndMatch == null) this.subtemplateIfEndMatchDone = true;
            if(this.mappedExpressionMatchDone && this.declaredIterationMatchDone
            && this.subtemplateForEachStartMatchDone && this.subtemplateForEachEndMatchDone
            && this.subtemplateIfStartMatchDone && this.subtemplateIfEndMatchDone){
                break;
            }

            if (mappedExpressionMatch != null) {
                matches.push(new ElementMatch("mappedExpression", mappedExpressionMatch));
            }
            if (declaredIterationMatch != null) {
                matches.push(new ElementMatch("declaredIteration", declaredIterationMatch));
            }
            if (subtemplateForEachStartMatch != null) {
                matches.push(new ElementMatch("forEachBlock", subtemplateForEachStartMatch));
            }
            if (subtemplateIfStartMatch != null) {
                matches.push(new ElementMatch("ifBlock", subtemplateIfStartMatch));
            }
            if (subtemplateForEachEndMatch != null) {
                matches.push(new ElementMatch("forEachBlockEnd", subtemplateForEachEndMatch));
            }
            if (subtemplateIfEndMatch != null) {
                matches.push(new ElementMatch("ifBlockEnd", subtemplateIfEndMatch));
            }
        }
        matches.sort(TemplateScanner.sorter);
        matches.forEach(match => {
            console.log("Found a ["+match.type+"] at index ["+match.regex.index+"] it says ["+match.regex[0]+"]");
        });
        return matches;
    }

    private static sorter(exec1: ElementMatch, exec2: ElementMatch): number {
        return exec1.regex.index - exec2.regex.index;
    }
}

export class ElementMatch {
    constructor(public type: string, public regex: RegExpExecArray) {
    }
}