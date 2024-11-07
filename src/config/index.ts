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
    //Google Sheets
    spreadsheetId: process.env.SPREADSHEET_ID,
    privateKey: process.env.PRIVATE_KEY ,
    clientEmail: process.env.CLIENT_EMAIL,
    //Urls
    URL_ALUMBRADO : process.env.alumbradoPublico,
    URL_ANIMALES : process.env.animalesSueltos,
    URL_OBRAS : process.env.obrasPublicasInconclusas,
    URL_VEREDAS : process.env.veredasMalEstado,
    URL_RUIDOS : process.env.ruidosMolestos,
    URL_PODA : process.env.podaDeArboles,
    URL_TRANSPORTE : process.env.trasportePublico,
    URL_RECOLECCION : process.env.recoleccionDeResiduos,
    URL_AGUA : process.env.fugaDeAgua,
    URL_GAS : process.env.problemasGas,

};