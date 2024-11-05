import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4';
import { config } from '../config';
import { request } from 'http';

export class SheetManager {
    private sheets: sheets_v4.Sheets;
    private spreadsheetId: string;

    constructor(spreadsheetId: string, privateKey: string, clientEmail: string) {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        this.spreadsheetId = spreadsheetId;
    }

    // Función para verificar si un usuario existe en la hoja de cálculo
    async userExists(userId: string): Promise<boolean> {
        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'users!A:A', // asumiendo que la columna A tiene los ids de los usuarios
            });
            const rows = result.data.values;
            if (rows) {
                const numbers = rows.map(row => row[0]);
                return numbers.includes(userId);
            }
            return false;
        } catch (error) {
            console.error('Error al verificar si el usuario existe', error);
            return false;
        }
    }
    async createUser(number: string, name: string, mail: string): Promise<void> {
        try {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'users!A:C',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[number, name, mail]]
                }
            });

            await this.sheets.spreadsheets.batchUpdate({

                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: 
                    [   {
                            addSheet: {
                                properties: {
                                  title: number
                                },
                            },
                        }
                    ],
                },
            });
        } catch (error) {
            console.error('Error al crear el usuario', error);
        }
    }   
}

export default new SheetManager(
    config.spreadsheetId,
    config.privateKey,
    config.clientEmail
);