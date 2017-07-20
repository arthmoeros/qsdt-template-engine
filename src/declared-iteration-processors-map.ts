import { Annotation } from "@artifacter/common";

import { Osb11gGuid } from "./core/osb-11g-guid";
import { NumberCounter } from "./core/number-counter";
import { DeclaredIterationProcessor } from "./core/declared-iteration-processor";

/**
 * @class DeclaredIterationProcessorsMap
 * @see npm @artifacter/template-engine
 * @see also README.md of this project for an explanation about atmpl files and declared iteration processors
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This class is used to invoke Declared Iteration Processors, for use with Declared Iterations
 * 
 */
export class DeclaredIterationProcessorsMap {

	private coreProcessors: any;
	private customProcessors: any;

	/**
	 * Creates a DeclaredIterationProcessorsMap, it can be supplied with custom processors,
	 * these must extend the DeclaredIterationProcessor class
	 * @param customProcessors 
	 */
	constructor(customProcessors?: DeclaredIterationProcessor[]) {
		this.coreProcessors = {};
		let coreOsb11gGuid: DeclaredIterationProcessor = new Osb11gGuid()
		this.coreProcessors[coreOsb11gGuid.identifier()] = coreOsb11gGuid;
		
		let numberCounter: DeclaredIterationProcessor = new NumberCounter()
		this.coreProcessors[numberCounter.identifier()] = numberCounter;

		this.customProcessors = {};
		if (customProcessors != null) {
			customProcessors.forEach(proc => {
				this.customProcessors[proc.identifier()] = proc;
			});
		}
	}

	/**
	 * Runs the #initialize() method on all processors
	 */
	public initializeProcessors(){
		for(var key in this.coreProcessors){
			this.coreProcessors[key].initialize();
		}
		for(var key in this.customProcessors){
			this.customProcessors[key].initialize();
		}
	}

	/**
	 * Invokes a processor #nextValue() method and returns its value
	 * @param identifier the processor's identifier
	 */
	public invoke(identifier: string): string {
		let coreProcessor = this.coreProcessors[identifier];
		if(coreProcessor == null){
			let customProcessor = this.customProcessors[identifier];
			if(customProcessor == null){
				throw new Error("Unknown processor requested: "+identifier+", no match found on core processors, neither on custom processors");
			} else {
				return customProcessor.nextValue();
			}
		}else{
			return coreProcessor.nextValue();
		}
	}
}