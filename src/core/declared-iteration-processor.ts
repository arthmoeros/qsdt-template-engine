/**
 * @class DeclaredIterationProcessor
 * This class must be extended for its use with Declared Iteration functions.
 * 
 * An implementer must fulfill all three abstract methods.
 * 
 * When the engine finds a Declared Iteration, it will bind it to an instance
 * of an implementer of this class, this bind it is done by matching the
 * identifier in the template with the one returned by the #identifier()
 * method. Then it will invoke the #initialize() method for each template processed.
 * Each mapped iteration will be filled with the value returned by the #nextValue()
 * method.
 */
export abstract class DeclaredIterationProcessor{

    /**
     * This method must return an unique identifier for the declared iteration being used
     */
    public abstract identifier(): string;

    /**
     * This method must initialize the state of the declared iteration
     */
    public abstract initialize(): void;

    /**
     * This method must return the next value in the iteration
     */
    public abstract nextValue(): string;

}