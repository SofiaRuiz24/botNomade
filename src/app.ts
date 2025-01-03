import { createBot } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { provider } from "../src/provider";
import  templates from "../src/templates";
import { config } from "../src/config";

const PORT = Number(config.port);

const main = async () => {
    const {handleCtx, httpServer} = await createBot({
        flow: templates,
        provider: provider,
        database: new Database(),
        })
        httpServer(PORT);
}
main()