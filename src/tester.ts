import { TemplateProcessor } from "./template.processor";
import * as fs from "fs";

let tmplProc: TemplateProcessor = new TemplateProcessor("./test/proxy_service.proxy.abtmpl",fs.readFileSync("./test/proxy_service.proxy.abtmpl"));
let map: Map<string, string> = new Map<string, string>();

map.set("bizDomain","dominio");
map.set("bizEntity","entidad");
map.set("serviceId","11");
map.set("serviceName","consultaInfo");
//map.set("serviceType","ABC");
map.set("serviceVersion","v1.0");
console.log(tmplProc.run(map));
