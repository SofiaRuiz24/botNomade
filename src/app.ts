import { createBot } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { provider } from "../src/provider";
import templates from "../src/templates";
import { config } from "../src/config";
import { conectarDB } from "./db/mongoDB";
import * as puppeteer from "puppeteer";
import { completarFormularioOnline } from "./services/autoReclamo";
import fs from 'fs';
import path from 'path';

const PORT = Number(config.port);

const main = async () => {
    await conectarDB();

    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const { handleCtx, httpServer } = await createBot({
        flow: templates,
        provider: provider,
        database: new Database(),
    })
    httpServer(PORT);
    //const prueba = '7c476c35-5f8a-41ce-9930-da81a1a51bf3';
    //completarFormularioOnline(prueba, '');
}
main()