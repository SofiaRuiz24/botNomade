import { createFlow } from "@builderbot/bot";
import { mainFlow } from "./mainFlow";
import { faqFlow } from "./faqFlow";
import { registerFlow } from "./registerFlow";


export default createFlow([
    mainFlow,
    faqFlow,
    registerFlow
]);