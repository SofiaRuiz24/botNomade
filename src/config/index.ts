import "dotenv/config";

export const config = {
  port: process.env.PORT || 3008,
    //Meta
    jwtToken: process.env.jwtToken,
    numberId: process.env.numberId,
    verifyToken: process.env.verifyToken,
    version: "v21.0",
    //OpenAI
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
};