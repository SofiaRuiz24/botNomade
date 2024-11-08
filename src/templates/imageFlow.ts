import { addKeyword, EVENTS } from "@builderbot/bot";
import { imageToText } from "../provider/gemini";

const imageFlow = addKeyword(EVENTS.MEDIA)
    .addAction(async (ctx, ctxFn) => {
        const localPath = await ctxFn.provider.saveFile(ctx, {path: './assets/tmp'})
        const text = await imageToText('Describe la imagen, teniendo en cuenta que el ciudadano esta realizando un reclamo a la municipalidad ', localPath)
        return ctxFn.flowDynamic(text)
    })

export { imageFlow };