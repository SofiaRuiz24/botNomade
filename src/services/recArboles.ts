import puppeteer from 'puppeteer';
import { Reclamo } from '~/model/Reclamo';
import { config } from '~/config';
import path from 'path';

export const completarFormularioOnline = async (reclamo: Reclamo ,localPath: string): Promise<void> => {
    let url = '';
    console.log(reclamo.type);
    switch (reclamo.type) {
        case 'RECLAMO IDENTIFICADO: Poda de Árboles':
            url = config.URL_PODA;
            break;
        case 'RECLAMO IDENTIFICADO: Alumbrado Público':
            url = config.URL_ALUMBRADO
            break;
        case 'RECLAMO IDENTIFICADO: Animales Sueltos':
            url = config.URL_ANIMALES
            break;
        case 'RECLAMO IDENTIFICADO: Obras Públicas Inconclusas':
            url = config.URL_OBRAS
            break;
        case 'RECLAMO IDENTIFICADO: Veredas en Mal Estado':
            url = config.URL_VEREDAS
            break;
        case 'RECLAMO IDENTIFICADO: Ruidos Molestos':
            url = config.URL_RUIDOS
            break;
        case 'RECLAMO IDENTIFICADO: Transporte Público':
            url = config.URL_TRANSPORTE
            break;
        case 'RECLAMO IDENTIFICADO: Recolección de Residuos':
            url = config.URL_RECOLECCION
            break;
        case 'RECLAMO IDENTIFICADO: Fuga de Agua':
            url = config.URL_AGUA
            break;
        case 'RECLAMO IDENTIFICADO: Problemas de Gas':
            url = config.URL_GAS
            break;
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navegar a la URL del formulario
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Completar cada campo del formulario usando IDs secuenciales
        await page.type('#claim_answers_attributes_0_input_string', reclamo.name); // Nombre Completo
        await page.select('#claim_answers_attributes_1_input_string', reclamo.docType); // Tipo de Documento (campo de selección)
        await page.type('#claim_answers_attributes_2_input_string', reclamo.docNumber); // Número de Documento
        await page.type('#claim_answers_attributes_3_input_string', reclamo.phone); // Teléfono
        await page.type('#claim_answers_attributes_4_input_string', reclamo.email); // Correo Electrónico

        // Campos de dirección
        await page.type('#address_street', reclamo.address); // Calle
        await page.type('#address_number', "123"); // Número
        await page.type('#address_floor', "1"); // Piso/Casa (ajusta según el dato si está disponible)
        await page.type('#address_apartment', "Departamento"); // Dpto
        await page.type('#address_references', "Referencias para identificar la direccion especificada."); // Referencias

        // Hacer clic en el botón "Siguiente"
        await page.click('input[value="Siguiente"]'); // Ajusta el selector si es necesario
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Completar la segunda sección
        await page.type('#claim_answers_attributes_0_input_text', reclamo.descriptionRec); // Descripción del reclamo
        //await page.type('#claim_answers_attributes_11_input_string', reclamo.dateRec.toISOString().split('T')[0]); // Fecha del reclamo en formato YYYY-MM-DD
       
        
        //Adjuntar un archivo si es necesario
        const filePath = path.resolve(localPath);
        //const filePath = `../../assets/tmp/${reclamo.id}.jpeg`; // Reemplaza con la ruta real del archivo si tienes uno
       
        if (filePath  !== '' && filePath !== undefined && filePath !== 'base-ts-meta-memory' && filePath !== 'base-ts-meta-memory.d.ts' && filePath !== 'undefined' && filePath !== 'base_ts_meta_memory') {
            const fileInput = await page.$('input[type="file"]#claim_answers_attributes_1_files'); // Ajusta el ID si es necesario
            if (fileInput) {
                await (fileInput as any).uploadFile(filePath );
                
            }

        }
        await page.type('#claim_answers_attributes_2_input_date', reclamo.dateRec);
        await page.keyboard.press('Enter'); 
        // Enviar el formulario
        //await page.click('input[value="Enviar"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Esperar a que el formulario se envíe
        await page.waitForNavigation();
        console.log("Formulario enviado con éxito");

    } catch (error) {
        console.error("Error al completar el formulario:", error);
    } finally {
        await browser.close();
    }
};
