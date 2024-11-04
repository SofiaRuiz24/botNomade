import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets';
import { config } from '../config';

class SheetManager {
    private sheets: sheets_v4.Sheets;
    private spreadsheetId: string;

    constructor(spreadsheetId: string, privateKey: string, clientEmail: string) {   
        const auth = new google.auth.GoogleAuth({
            credential:{
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
}

export default new SheetManager(
    config.spreadsheetId,
    config.privateKey,
    config.clientEmail
);