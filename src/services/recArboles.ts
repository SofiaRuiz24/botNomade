import puppeteer from 'puppeteer';
import { Reclamo } from '~/model/Reclamo';

export const completarFormularioOnline = async (reclamo: Reclamo): Promise<void> => {
    const url = 'https://reclamos.reclamos311.com.ar/incidents/10-poda-de-arboles/claims/new';
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
        await page.type('#claim_answers_attributes_2_input_date', reclamo.dateRec);
        await page.keyboard.press('Enter'); 
        
        /* Adjuntar un archivo si es necesario
        const filePath = '/path/to/file.jpg'; // Reemplaza con la ruta real del archivo si tienes uno
        const fileInput = await page.$('#claim_answers_attributes_12_input_file'); // Ajusta el ID si es necesario
        if (fileInput) {
            await fileInput.uploadFile(filePath);
        }*/

        // Enviar el formulario
        /*await page.click('input[value="Enviar"]');*/
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
