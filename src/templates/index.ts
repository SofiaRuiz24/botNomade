import { createFlow } from "@builderbot/bot";
import { mainFlow } from "./mainFlow";
import { faqFlow } from "./faqFlow";

export default createFlow([
    mainFlow, 
    faqFlow
]);