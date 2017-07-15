import * as fs from "fs";

import { TemplateProcessor } from "./../src/template.processor";

let tests: any = JSON.parse(fs.readFileSync(__dirname+"/test.atmpl").toString());

let testMap: Map<string, string> = new Map<string, string>();
for (let key in tests.testMap) {
    testMap.set(key, tests.testMap[key]);
}
let testParameters: any = tests.testParameters;

console.log("Testing mapped expressions");
for (let key in tests.mappedExpressionTest) {
    console.log("Testing " + key);
    let processor: TemplateProcessor = new TemplateProcessor(tests.mappedExpressionTest[key].expr);
    let outcome: string = processor.run(testMap);
    if (outcome == tests.mappedExpressionTest[key].expectedOutcome) {
        console.log("Test is SUCCESSFUL");
    } else {
        console.log("Test is UNSUCCESSFUL: outcome vs expected -> " + outcome + " VS " + tests.mappedExpressionTest[key].expectedOutcome);
    }
}

console.log("Testing Parameterized Expression");
let processor: TemplateProcessor = new TemplateProcessor(tests.parameterizedExpressionTest.test.expr);
processor.setTemplateParameters(testParameters);
let outcome: string = processor.run(testMap);
if (outcome == tests.parameterizedExpressionTest.test.expectedOutcome) {
    console.log("Test is SUCCESSFUL");
} else {
    console.log("Test is UNSUCCESSFUL: outcome vs expected -> " + outcome + " VS " + tests.parameterizedExpressionTest.test.expectedOutcome);
}



console.log("Testing Iterated Expression");
let processor2: TemplateProcessor = new TemplateProcessor(tests.iteratedExpressionTest.test.expr);
let outcome2: string = processor2.run(testMap);
if (outcome2 == tests.iteratedExpressionTest.test.expectedOutcome) {
    console.log("Test is SUCCESSFUL");
} else {
    console.log("Test is UNSUCCESSFUL: outcome vs expected -> " + outcome2 + " VS " + tests.iteratedExpressionTest.test.expectedOutcome);
}

