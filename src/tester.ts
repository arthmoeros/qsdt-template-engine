import { TemplateProcessor } from "./template.processor";

let tmplProc: TemplateProcessor = new TemplateProcessor("./test/test.abtmpl");
let map: Map<string, string> = new Map<string, string>();

map.set("a","asdf");
map.set("b","qwer");
map.set("c","");
map.set("d","sadasdas");
map.set("e","1111");
console.log(tmplProc.run(map));
