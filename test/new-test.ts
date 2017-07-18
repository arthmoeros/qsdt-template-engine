import * as fs from "fs";
import { TemplateProcessor } from "../src/template.processor";

let processor: TemplateProcessor = new TemplateProcessor("new-format-test.atmpl", fs.readFileSync(__dirname+"/new-format-test.atmpl"));

console.log(processor.checkSyntax());

let input: {} = {
  key : {
    name: "llave",
    value: "Test Plantilla",
  },
  sections: [
    {
      id: "SEC1",
      name: "Section 1",
      value: "ABC",
      items: [
        {
          key: "A1",
          value: "Valor 1 seccion 1"
        },
        {
          key: "A2",
          value: "Valor 2 seccion 1"
        },
        {
          key: "A3",
          value: "Valor 3 seccion 1"
        },
      ]
    },
    {
      id: "SEC2",
      name: "Section 2",
      value: "XYZ",
      items: [
        {
          key: "B1",
          value: "Valor 1 seccion 2"
        },
        {
          key: "B2",
          value: "Valor 2 seccion 2"
        },
      ]
    },
  ],
  conditioned: {
    special: "AAA",
  },

}

processor.setTemplateParameters({
  parameter : "&{key.name}"
});


console.log(processor.run(input));