import { createFlow } from "@builderbot/bot";
import { mainFlow } from "./mainFlow";
import { faqFlow } from "./faqFlow";
import { registerFlow } from "./registerFlow";
import { reclamoFlow } from "./reclamoFlow";
import { imageFlow } from "./imageFlow";

export default createFlow([
    mainFlow,
    faqFlow,
    registerFlow,
    reclamoFlow,
    imageFlow,
]);