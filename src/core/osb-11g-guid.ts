import { DeclaredIterationProcessor } from "./declared-iteration-processor";
import { Osb11gGuidGenerator } from "./osb11g/osb11g-guid-generator";

export class Osb11gGuid extends DeclaredIterationProcessor{

    private static readonly osb11gGuidGenerator: Osb11gGuidGenerator = new Osb11gGuidGenerator();

    public identifier(): string {
        return "generateOsb11gGUID";
    }
    public initialize(): void {
    }
    public nextValue(): string {
        return Osb11gGuid.osb11gGuidGenerator.generateOsb11gGUID();
    }

}