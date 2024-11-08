import { config } from '../config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";

const genAi = new GoogleGenerativeAI(config.GEMINI_APIKEY);
const model = genAi.getGenerativeModel({model: "gemini-1.5-flash"});

export async function chatGemini(prompt: string, text: string){

    const formatPrompt = prompt + `\n\nEl ciudadano envia esta imagen:` + text;

    const result = await model.generateContent(formatPrompt);
    const response = result.response;
    const answer = response.text;
    return answer;
}

export async function imageToText(prompt: string, imagePath: string): Promise<string> {
    
    const resolvePath = path.resolve(imagePath);
    const imageBuffer = fs.readFileSync(resolvePath);
    const image = {
        inlineData:{
            data: imageBuffer.toString('base64'),
            mimeType: "image/png",
        }
    }

    const result = await model.generateContent([prompt, image]);
    return result.response.text();
}

