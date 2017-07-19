import { DeclaredIteration } from "./../entity/declared-iteration";
import { MappedExpression } from "./../entity/mapped-expression";
import { SubTemplate } from "./../entity/sub-template";

export class TemplateScanner {

    private contents: string;

    private declaredIterationMatcher: RegExp;
    private mappedExpressionMatcher: RegExp;
    private subtemplateForEachStartMatcher: RegExp;
    private subtemplateForEachEndMatcher: RegExp;
    private subtemplatePresentStartMatcher: RegExp;
    private subtemplatePresentEndMatcher: RegExp;

    private declaredIterationMatchDone: boolean = false;
    private mappedExpressionMatchDone: boolean = false;
    private subtemplateForEachStartMatchDone: boolean = false;
    private subtemplatePresentStartMatchDone: boolean = false;
    private subtemplateForEachEndMatchDone: boolean = false;
    private subtemplatePresentEndMatchDone: boolean = false;

    private matches: ElementMatch[];

    constructor(contents: string) {
        this.contents = contents;

        this.mappedExpressionMatcher = new RegExp(MappedExpression.regex);
        this.declaredIterationMatcher = new RegExp(DeclaredIteration.regex);
        this.subtemplateForEachStartMatcher = new RegExp(SubTemplate.regexForEachStart);
        this.subtemplateForEachEndMatcher = new RegExp(SubTemplate.regexForEachEnd);
        this.subtemplatePresentStartMatcher = new RegExp(SubTemplate.regexPresentStart);
        this.subtemplatePresentEndMatcher = new RegExp(SubTemplate.regexPresentEnd);
    }

    public run() : ElementMatch[] {
        let matches: ElementMatch[] = [];
        while (true) {
            let mappedExpressionMatch: RegExpExecArray = null;
            let declaredIterationMatch: RegExpExecArray = null;
            let subtemplateForEachStartMatch: RegExpExecArray = null;
            let subtemplatePresentStartMatch: RegExpExecArray = null;
            let subtemplateForEachEndMatch: RegExpExecArray = null;
            let subtemplatePresentEndMatch: RegExpExecArray = null;
            if(!this.mappedExpressionMatchDone)
                mappedExpressionMatch = this.mappedExpressionMatcher.exec(this.contents);
            if(!this.declaredIterationMatchDone)
                declaredIterationMatch =this.declaredIterationMatcher.exec(this.contents);
            if(!this.subtemplateForEachStartMatchDone)
                subtemplateForEachStartMatch =this.subtemplateForEachStartMatcher.exec(this.contents);
            if(!this.subtemplatePresentStartMatchDone)
                subtemplatePresentStartMatch =this.subtemplatePresentStartMatcher.exec(this.contents);
            if(!this.subtemplateForEachEndMatchDone)
                subtemplateForEachEndMatch =this.subtemplateForEachEndMatcher.exec(this.contents);
            if(!this.subtemplatePresentEndMatchDone)
                subtemplatePresentEndMatch =this.subtemplatePresentEndMatcher.exec(this.contents);

            if (mappedExpressionMatch == null) this.mappedExpressionMatchDone = true;
            if (declaredIterationMatch == null) this.declaredIterationMatchDone = true;
            if (subtemplateForEachStartMatch == null) this.subtemplateForEachStartMatchDone = true;
            if (subtemplatePresentStartMatch == null) this.subtemplatePresentStartMatchDone = true;
            if (subtemplateForEachEndMatch == null) this.subtemplateForEachEndMatchDone = true;
            if (subtemplatePresentEndMatch == null) this.subtemplatePresentEndMatchDone = true;
            if(this.mappedExpressionMatchDone && this.declaredIterationMatchDone
            && this.subtemplateForEachStartMatchDone && this.subtemplateForEachEndMatchDone
            && this.subtemplatePresentStartMatchDone && this.subtemplatePresentEndMatchDone){
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
            if (subtemplatePresentStartMatch != null) {
                matches.push(new ElementMatch("presentBlock", subtemplatePresentStartMatch));
            }
            if (subtemplateForEachEndMatch != null) {
                matches.push(new ElementMatch("forEachBlockEnd", subtemplateForEachEndMatch));
            }
            if (subtemplatePresentEndMatch != null) {
                matches.push(new ElementMatch("presentBlockEnd", subtemplatePresentEndMatch));
            }
        }
        matches.sort(TemplateScanner.sorter);
        // matches.forEach(match => {
        //     console.log("Found a ["+match.type+"] at index ["+match.regex.index+"] it says ["+match.regex[0]+"]");
        // });
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