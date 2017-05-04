# @artifacter/template-engine

### What's this? - Intro
This is the core of the Template Engine that Artifacter uses for its artifacts generation, it makes use of the atmpl format whose syntax is explained further in this same document. This engine is made for Artifacter, but has the purpose of reusability in mind, so any other consumer can extend it a bit without modifying its core, it allows a bit further customization on its template processing via Custom Pipe Functions and Custom Template Functions. For now they have very basic support, but there are plans on widening the customization scope of these.

### What's in here? - API
The available API for those who import the package is as follows:

##### TemplateProcessor
This is the main class for template processing, it uses a Map<string, string> to process the template into a filled artifact with its data. It can use a filename and filecontents to process a template or make use of an "anonymous template" providing only a string containing a template (to be used with single strings).

### What is that _atmpl_ format? - atmpl syntax
The atmpl format is Artifacter template syntax, for simplicity sake let's say we have a html file that we want prerendered with specific data, being part of a build-time file or a deliverable artifact, we should use this file as a basis for our template. This template, onwards the "atmpl" file, can have any text within it, the engine will only look for certain declarations and expressions to fill them with additional data in its processing, using a map provided to the processor.

##### Mapped Expression
This expression defines how a value contained in a map under certain key will replace it content, a Mapped Expression is broken down as follows:

![alt mapped-expression-syntax-img](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/doc-img/mapped_expression_syntax.gif)

Now, about these parts:

Element | Description | Required?
------- | ----------- | ----------
Expression Begin|Indicates that a mapped expression is here|Yes
Optional indicator|Indicates that this expression is optional and doesn't require a found value in the map (further explanation below)|No
String Pipe Functions|Pipe functions to process the incoming string before the expression replacement (further explanation below)|No
Mapped Key|The key that will be used to look for a value to use as a replacement of the expression in the provided map to the processor|Yes
Ternary operator|This operator checks if the resulting value is empty or not (further explanation below)|No
Ternary resulting values|This values will be used in the ternary operation|Only the first when a ternary operator is found
Expression End|Indicates the end of the mapped expression|Yes

###### Optional indicator
When an optional indicator is present in the expression, the engine will replace the expression with an empty string if a value is not found in the provided map using the mapped key present in the expression, in the other hand, if the expression is not optional (meaning that an optional indicator is **not** present), the engine will raise a warning indicating that the value wasn't found in the map and the artifact will be partially invalid because it will contain an unprocessed mapped expression.

###### Pipe Functions
The listed string Pipe Functions must follow the following contract:

```typescript
@PipeFunction()
function functionName(strParam: string): string{
  //process string here and return processed string
}
```

The engine will pass the obtained value from the map to each function in a pipe manner, in other words, the resulting value of each function will pass to the next function and so on until all functions had been executed, the order of execution is from left to right.

The engine does check that each custom function fulfills the contract by reading its @PipeFunction annotation and its metadata.

###### Ternary Operator
This operator changes the expression replacement behavior, if the mapped key results in a value, it will be checked by the engine if it is a empty string or not, depending on this the expression will be replaced by the first resulting value defined or the second. The first value is required in the expression only if a ternary operator is declared, the second isn't required. If a second value is not declared and the found value is empty, the replacement will be done with an empty string.

#### Declared Iteration & Iterated Expression
Iteration in the atmpl syntax can be used to put iterated values on each template, for this to work, an Iteration must be declared indicating its iteration key for reference and a template function to execute for each finding of a iterated expression, which contains only the iteration key reference. In this case there is no pre-processing of the value like the mapped expression. Iterated expressions must have a corresponding Declared Iteration written in the template, if a "orphan" Iterated Expression is found, the engine will raise an error, in the other hand Declared Iterations can be on their own. Now, let's talk about syntax:

![alt iteration-syntax-img](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/doc-img/iteration_syntax.gif)

*(In this case, all elements are required)*

Element | Description
------- | -----------
Declared Iteration Begin|Indicates that a declared iteration is here
Iteration Key|Identifies the declaration and its execution for iterated expression reference
Template Function|Template function to run for each iterated expression referring to the Iteration Key (further explanation below)
Declared Iteration End|Indicates the end of the declared iteration
Iterated Expression Begin|Indicates that a iterated expression is here
Declared Iteration Key (or Iteration Key)|Is the reference to the declared iteration, the function associated will be run and its result will replace this expression (further explanation below)
Iterated Expression End|Idicates the end of the iterated expression

##### Template Functions
These functions must have instance variables associated, so there can be a real iteration process, the invoked function just returns a string with the result of the next value to place into each iterated expression, these functions must be annotated with the @TemplateFunction annotation and fulfill the following contract:

```typescript
@TemplateFunction()
function templateFunction(): string{
  // No parameters and returns a string
}
```

Must not have parameters and must return a string, this might change in the future, should the necessity arises of a template function with parameters. Just like Pipe Functions, these will be validated by the engine.

### What's next? - Future features

\*WIP\*
