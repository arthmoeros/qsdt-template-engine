import { DeclaredIterationProcessor } from "./declared-iteration-processor";
import { Osb12cGuidGenerator } from "./osb12c/osb12c-guid-generator";

export class Osb12cGuid extends DeclaredIterationProcessor{

    private static readonly osb12cGuidGenerator: Osb12cGuidGenerator = new Osb12cGuidGenerator();

    public identifier(): string {
        return "generateOsb12cGUID";
    }
    public initialize(): void {
    }
    public nextValue(): string {
        return Osb12cGuid.osb12cGuidGenerator.generateOsb12cGUID();
    }

}