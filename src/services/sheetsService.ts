import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets';
import { config } from '../config';

class SheetManager {
    private sheets: sheets_v4.Sheets;
    private spreadsheetId: string;

    constructor(spreadsheetId: string, privateKey: string, clientEmail: string) {   
        const auth = new google.auth.GoogleAuth({
            credentials:{
                private_key: privateKey,
                client_email: clientEmail,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        this.sheets = google.sheets({ version: 'v4', auth });
        this.spreadsheetId = spreadsheetId;
    }

    //Funcion para verificar si un usuario existe.
    async userExists(number: string): Promise<boolean> {
        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:A', //Asumiendo que los números de telefono estan en la columna A
            });
            const rows = result.data.values;
            if(rows){
                const numbers = rows.map(row => row[0]);
                return numbers.includes(number);
            }
            return false;
        } catch (error) {
            console.error('Error al verificar si el usuario existe:', error);
            return false;
        }
    }

    //Funcion para crear un usuario y una nueva pestaña
    async createUser(number: string, name: string, email: string): Promise<void> {
        try {
            //Agregar usuario a la pestaña 'Users'
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:C',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[number, name, email]]
                }
            });
            //Crear una nueva pestaña con el nombre del número de telefdono
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: number
                                }
                            }
                        }
                    ]
                }
            });
        } catch (error) {
            console.error('Error al crear un usuario o nueva pestaña:', error);
        }
    }

    //Funcion para obtener preguntas/respuestas invertidas
    async getUserConv(number: string): Promise<any[]> {
        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${number}!A:B`, //Asumiendo que las preguntas estan en la columna A y las respuestas en la columna B
            });

            const rows = result.data.values;
            if(!rows || rows.length === 0){
                return [];
            }

            //Tomar las ultimas preguntas/respuestas maximo 3 y revertir orden
            const lastConversaciones = rows.slice(-3).reverse();

            //Formatear las respuestas en el formato esperado por el bot
            const formatedConversaciones = [];
            for(let i = 0; i < lastConversaciones.length; i++){
                const conversacion = lastConversaciones[i];
                formatedConversaciones.push({
                    question: conversacion[0],
                    answer: conversacion[1]
                });
            }
            return formatedConversaciones;
        } catch (error) {
            console.error('Error al obtener la conversación del usuario:', error);
        }
    }
    //Funcion para agregar una conversacion al inicio de la pestaña del usuaio
    async addConvertoUser(number: string, conversation: { role: string, content: string}[]): Promise<void> {
        try {
            const question = conversation.find(c => c.role === 'user')?.content;
            const answer = conversation.find(c => c.role === 'assistant')?.content;
            const date = new Date().toISOString(); //Fecha actual en formato ISO

            if(!question || !answer){
                throw new Error('La conversación debe contener al menos una pregunta y una respuesta.');
            }

            //Leer las filas actuales para empujarlas hacia abajo
            const sheetData = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${number}!A:C`,
            });

            const rows = sheetData.data.values || [];

            //Agregar la nueva conversación al inicio
            rows.unshift([question, answer, date]);

            //Escribir las nuevas filas en la pestaña
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${number}!A:C`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: rows
                }
            });
        } catch (error) {
            console.error('Error al agregar una conversación:', error);
        }
    }
}

export default new SheetManager(
    config.spreadsheetId,
    config.privateKey,
    config.clientEmail
);