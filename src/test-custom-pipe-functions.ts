import { CustomPipeFunctions } from "./type/custom-pipe-functions";

var value = "LALALA";

var func1 = (value, param1, param2, param3) : string => {
    return value + " AAA " + param1 + param2 + param3;
};

let cpf : CustomPipeFunctions = new CustomPipeFunctions();
cpf.addFunction("func1", func1);

console.log(cpf.invoke("func1", value, ["wer","6","4"]));