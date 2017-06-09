import * as fs from "fs";

import { TemplateProcessor } from "./../src/template.processor";

let proc: TemplateProcessor = new TemplateProcessor("proxy_service.proxy.atmpl", fs.readFileSync(__dirname+"/proxy_service.proxy.atmpl"));

let values: Map<string, string> = new Map<string, string>();
values.set("bizDomain","pepito");
values.set("bizEntity","entito");
values.set("serviceId","11");
values.set("serviceName","getInfo");
//values.set("serviceType","ACB");
values.set("serviceVersion","v1.0");
console.log(proc.run(values));