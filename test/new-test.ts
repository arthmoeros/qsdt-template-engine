import * as fs from "fs";
import { TemplateScanner } from "../src/core/template-scanner";

new TemplateScanner("new-format-test.atmpl", fs.readFileSync(__dirname+"/new-format-test.atmpl").toString()).scan();