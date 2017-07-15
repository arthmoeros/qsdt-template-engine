import { DeclaredIterationProcessor } from "./declared-iteration-processor";

export class NumberCounter extends DeclaredIterationProcessor{

    private internalNumber: number;

    public identifier(): string {
        return "numberCounter";
    }
    public initialize(): void {
        this.internalNumber = 0;
    }
    public nextValue(): string {
        this.internalNumber += 1;
        return this.internalNumber.toString();
    }

}