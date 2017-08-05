# ![artifacter-logo](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/src/assets/img/rsz_artifacter-logo.png)@artifacter/template-engine (v2.0 release)

### Artifacter's template processing engine

#### What's new? - New Features in 2.0
- Input value now can be a fully structured Object (like a JSON)
    - Can include arrays
    - Backwards compatibility with Map<string,string> (internal conversion is done)
- For Each Sub-Templates
    - For use with arrays within the input object
    - Powered by Child Template Processors which retains all its parent reference
- Present Sub-Templates
    - Allows to skip a whole section if a given value is undefined/null in the input object

#### What's this? - Intro
This is the core of the Template Engine that Artifacter uses for its artifacts generation, it makes use of the atmpl format whose syntax is explained further in this same document. This engine is made for Artifacter, but has the purpose of reusability in mind, so any other consumer can extend it a bit without modifying its core, it allows a bit further customization on its template processing via Custom Pipe Functions and Declared Iteration Processors.

#### What's in here? - API
The available API for those who import the package is as follows:

##### TemplateProcessor
This is the main class for template processing, it uses a generic object {} to process the template into a filled artifact with its data. It can use a filename and filecontents to process a template or make use of an "anonymous template" providing only a string containing a template (to be used with single strings).
In the case of processing a file, the processor can also be provided with Custom Pipe Functions and/or Custom Declared Iteration Processors when you create an instance of it, when run it will use them if the template requires such customization.

#### What is that _atmpl_ format? - atmpl syntax
The atmpl format is Artifacter template syntax, for simplicity sake let's say we have a xml file that we want prerendered with specific data, being part of a build-time file or a deliverable artifact, we should use this file as a basis for our template. This template, onwards the "atmpl" file, can have any text within it, the engine will only look for certain declarations and expressions to fill them with additional data in its processing, using a generic object provided to the processor.

##### Mapped Expression
This expression defines how a value contained in a generic object under certain key will replace its content, a Mapped Expression is broken down as follows:

![alt mapped-expression-syntax-img](https://raw.githubusercontent.com/arthmoeros/artifacter-template-engine/master/doc/mapped_expression_syntax.gif)

Now, about these parts:

Element | Description | Required?
------- | ----------- | ----------
Expression Begin|Indicates that a mapped expression is here|Yes
Optional indicator|Indicates that this expression is optional and doesn't require a found value in the generic object (further explanation below)|No
String Pipe Functions|Pipe functions to process the incoming string before the expression replacement (further explanation below)|No
Mapped Key|The key that will be used to look for a value to use as a replacement of the expression in the provided generic object to the processor|Yes
Ternary operator|This operator checks if the resulting value is empty or not (further explanation below)|No
Ternary resulting values|This values will be used in the ternary operation|Only the first when a ternary operator is found
Expression End|Indicates the end of the mapped expression|Yes

###### Mapped Key syntax
Since v2.0 supports the use of a structured generic object, the mapped key can reference a specific property within this object, for example:

```typescript
let object = {
    gramps: {
        dad: {
            son : "kid",
            daughter: "kiddo"
        }
    }
}

// To get "kid", this expression would be used:
&{gramps.dad.son}
```

###### Optional indicator
When an optional indicator is present in the expression, the engine will replace the expression with an empty string if a value is not found in the provided generic object using the mapped key present in the expression, in the other hand, if the expression is not optional (meaning that an optional indicator is **not** present), the engine will raise a warning indicating that the value wasn't found in the generic object and the artifact will be partially invalid because it will contain an unprocessed mapped expression.

###### Pipe Functions
The engine will pass the obtained value from the generic object to each function in a pipe manner, in other words, the resulting value of each function will pass to the next function and so on until all functions had been executed, the order of execution is from left to right.

These can also be parameterized, the syntax supports passing arguments to each pipe function, for example:
```typescript
&{(paddLeft[15,'0'],auc,prefix['_'])gramps.dad.son}
```

Extending the available Pipe Functions is possible by using an instance of the CustomPipeFunctions class, this allows to
add named functions to the Template Processor, making then available to the processed template. For example:

```typescript
let custom: CustomPipeFunctions = new CustomPipeFunctions();
custom.addFunction("appendHelloWorld", (inputString, param1, param2) => {
    return inputString.concat("-hello-world");
});

let tmplProcessor: TemplateProcessor = new TemplateProcessor("templateFile.atmpl", fs.readFileSync("templateFile.atmpl"), custom);
tmplProcessor.run(testObject);

// Usage
&{(appendHelloWorld['param1','param2'])testKey}
```
The typing in the __addFunction__ method enforces the closure to support the given parameters and return value > (string, string...) : string

###### Ternary Operator
This operator changes the expression replacement behavior, if the mapped key results in a value, it will be checked by the engine if it is a empty string or not, depending on this the expression will be replaced by the first resulting value defined or the second. The first value is required in the expression only if a ternary operator is declared, the second isn't required. If a second value is not declared and the found value is empty, the replacement will be done with an empty string. A boolean evaluation can also be used.

```typescript
// Checks if value is empty or not
&{testValueEmpty ? 'valueNotEmpty' : 'valueEmpty'}

// Checks the boolean expression
&{testBoolean == 'notTestValue' ? 'valueTrue' : 'valueFalse'}
```

##### Declared Iteration & Iterated Expression
Iteration in the atmpl syntax can be used to put iterated values on each template, for this to work, an Iteration must be declared on a single line indicating its iteration key for reference and a Declared Iteration Processor identifier to execute for each finding of an iterated expression, which contains only the iteration key reference. In this case there is no pre-processing of the value like a mapped expression. Iterated expressions must have a corresponding Declared Iteration written in the template, if a "orphan" Iterated Expression is found, the engine will raise an error, in the other hand Declared Iterations can be on their own, as they are harmless and are deleted anyway on the final stage of the template processing. Now, let's talk about syntax:

```typescript
// Declared Iteration
#iteration(declaredIterationKey=declaredIterationIdentifier)

// Iterated Expression
&{#declaredIterationKey}
```

*(In this case, all elements are required)*

Element | Description
------- | -----------
Declared Iteration Key|Identifies the declaration and its execution for iterated expression reference
Declared Iteration Identifier|Identifier for matching Declared Iteration Processor, this runs the __initialize()__ method (further explanation below)
Declared Iteration Key (in Iterated Expression)|Is the reference to the declared iteration, the __nextValue()__ of the corresponding Declared Iteration Processor will be run and its result will replace this expression (further explanation below)

##### Declared Iteration Processor (previously known as Template Functions)
These are full fledged classes extending the abstract class DeclaredIterationProcessor, the Template Processor accepts an array of instances of implementors of this class, each requires to implement three methods:

Method | Description
------ | -----------
identifier|This method must return an unique identifier for the declared iteration being used
initialize|This method must initialize the state of the declared iteration
nextValue|This method must return the next value in the iteration

Example:

```typescript
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
```

##### Parameterized Expressions
In addition to a generic object, an object with parameters can be added to a Template Processor, then it will match any Parameterized Expression found in the template using these parameters, they are meant for single string template reutilization within other templates, be can be used for other purposes, its syntax is as follows:

```typescript
&{:parameterizedTemplate}
&{:parameterizedValue}
```

It can be used like this:

```typescript
let testParameters: {} = { 
    parameterizedTemplate: "&{keyOne}_&{keyTwo}",
    parameterizedValue: "testValue"
};

let tmplProcessor: TemplateProcessor = new TemplateProcessor("templateFile.atmpl", fs.readFileSync("templateFile.atmpl"), custom);
processor.setTemplateParameters(testParameters);
tmplProcessor.run(testObject);
```

##### "present" sub-template blocks
These blocks can serve the purpose of skiping a section of the template if a value is not present (undefined or null) in the input object, the syntax is pretty straight, it only must reference the property

```s
::present(gramps.uncle)::
    &{gramps.uncle.nephew}
::/present::
```

##### foreach sub-template blocks
This type of block can be used to repeat the output of an array within the input generic object for each of its items, this item reference can be used within the foreach block. Be wary that the item reference in the foreach name will override within this execution any parent reference already existing in the original input generic object.

```s
::foreach(sibling in gramps.dad.son.siblings)::
    &{sibling.name}
    &{sibling.age}
    &{gramps.dad.name}
::/foreach::
```

The parent object also can be referenced within the foreach block, its value will output repeated for each item in the array.

#### What's coming next? - Planned features for a future release

For this engine I don't have more ideas, I don't want it to become too complicated, with its current features I think is more than enough to support a wide variety of artifact generation options.

If you have any suggestion for new features, I will gladly hear you out along with a simple use case.

### Could I get some help with atmpl syntax? - Visual Studio Code Extension

The extension is available at the Visual Studio Code Marketplace as "Artifacter Template", here is a link -> [Click Here](https://marketplace.visualstudio.com/items?itemName=arthmoeros.artifacter-template)

However, it lacks some features from the v1.5 and v2.0 releases
