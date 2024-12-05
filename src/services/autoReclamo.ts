import puppeteer from 'puppeteer';
import { Reclamo } from '~/model/Reclamo';
import { config } from '~/config';
import path from 'path';
import { obtenerReclamo } from '~/controller/reclamoController';

export const completarFormularioOnline = async (Reclamo: Object ,localPath: string): Promise<void> => {
    let url = '';
    //TO DO
    //Desde el id del reclamo buscar en bd y traer el reclamo correspondiente.
    const reclamo = await obtenerReclamo(Reclamo);

    //Validacion de todos los campos
    if (!reclamo) {
        console.error("No se encontró el reclamo con el ID proporcionado.");
        return;
    }
    if (!reclamo.type) {
        console.error("El reclamo no tiene un tipo definido.");
        return;
    }
    if (!reclamo.name) {
        console.error("El reclamo no tiene un nombre definido.");
        return;
    }
    if (!reclamo.lastname) {
        console.error("El reclamo no tiene un apellido definido.");
        return;
    }
    if (!reclamo.docType) {
        console.error("El reclamo no tiene un tipo de documento definido.");
        return;
    }
    if (!reclamo.docNumber) {
        console.error("El reclamo no tiene un número de documento definido.");
        return;
    }
    if (!reclamo.phone) {
        console.error("El reclamo no tiene un número de teléfono definido.");
        return;
    }
    if (!reclamo.email) {
        console.error("El reclamo no tiene un correo electrónico definido.");
        return;
    }
    if (!reclamo.address) {
        console.error("El reclamo no tiene una dirección definida.");
        return;
    }
    if (!reclamo.direcNum) {
        console.error("El reclamo no tiene un número de dirección definido.");
        return;
    }
    if (!reclamo.descriptionRec) {
        console.error("El reclamo no tiene una descripción definida.");
        return;
    }
    if (!reclamo.dateRec) {
        console.error("El reclamo no tiene una fecha definida.");
        return;
    }
    console.log(reclamo.type);
  
    switch (reclamo.type) {
        case 'Reclamo: Poda de arboles':
            url = config.URL_PODA;
            break;
        case 'Reclamo: Alumbrado publico':
            url = config.URL_ALUMBRADO
            break;
        case 'Reclamo: Animales Sueltos':
            url = config.URL_ANIMALES
            break;
        case 'Reclamo: Obras publicas inconclusas':
            url = config.URL_OBRAS
            break;
        case 'Reclamo: Veredas en mal estado':
            url = config.URL_VEREDAS
            break;
        case 'Reclamo: Ruidos Molestos':
            url = config.URL_RUIDOS
            break;
        case 'Reclamo: Transporte publico' :
            url = config.URL_TRANSPORTE
            break;
        case 'Reclamo: Recoleccion de residuos':
            url = config.URL_RECOLECCION
            break;
        case 'Reclamo: Problemas de agua':
            url = config.URL_AGUA
            break;
        case 'Reclamo: Fuga de gas':
            url = config.URL_GAS
            break;
        case 'Reclamo: Rutas deteriorada':
            url = config.URL_RUTA
            break
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        let success = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!success && attempts < maxAttempts) {
            try {
                console.log(`Intento ${attempts + 1} de ${maxAttempts} para acceder a la URL: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle2' });
                success = true;
                console.log("Formulario cargado exitosamente.");
            } catch (error) {
                console.error(`Error al intentar cargar la URL en el intento ${attempts + 1}:`, error);
                attempts++;
                if (attempts < maxAttempts) {
                    console.log("Reintentando en 30 segundos...");
                    await new Promise(resolve => setTimeout(resolve, 30000));
                } else {
                    console.error("No se pudo cargar la URL después de varios intentos.");
                    throw new Error("Error al cargar la URL después de varios intentos.");
                }
            }
        }

        // Completar cada campo del formulario usando IDs secuenciales
        await page.type('#person_name', reclamo.name);//Nombre
        //verificar que se haya completado el campo nombre con puppeteer
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
            const name = await page.$eval('#person_name', el => (el as HTMLInputElement).value);
            if (name === '') {
                throw new Error("Error al completar el campo nombre");
            }
        } catch (error) {
            error.message = "Error al completar el campo nombre";
        } 
        await page.type('#person_flastname', reclamo.lastname); // Apellido 
        await page.select('#person_identifier_type', reclamo.docType); // Tipo de Documento (campo de selección)
        await page.type('#person_identifier', reclamo.docNumber); // Número de Documento
        await page.type('#person_phone', reclamo.phone); // Teléfono
        await page.type('#person_email', reclamo.email); // Correo Electrónico

        // Campos de dirección
        await page.type('#address_street', reclamo.address); // Calle
        await page.type('#address_number', reclamo.direcNum); // Número
        await page.type('#address_floor', reclamo.piso ); // Piso/Casa (ajusta según el dato si está disponible)
        await page.type('#address_apartment', reclamo.dpto); // Dpto
        //await page.type('#address_references', "Referencias para identificar la direccion especificada."); // Referencias
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Hacer clic en el botón "Siguiente"
        await page.click('input[value="Siguiente"]'); // Ajusta el selector si es necesario
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Completar la segunda sección
        await page.type('#claim_answers_attributes_0_input_text', reclamo.descriptionRec); // Descripción del reclamo
        //await page.type('#claim_answers_attributes_11_input_string', reclamo.dateRec.toISOString().split('T')[0]); // Fecha del reclamo en formato YYYY-MM-DD
       
        
        //Adjuntar un archivo si es necesario
        
        //const filePath = `../../assets/tmp/${reclamo.id}.jpeg`; // Reemplaza con la ruta real del archivo si tienes uno
       try{
        if (localPath  !== '' && localPath !== undefined && localPath !== 'base-ts-meta-memory' && localPath !== 'base-ts-meta-memory.d.ts' && localPath !== 'undefined' && localPath !== 'base_ts_meta_memory') {
            const filePath = path.resolve(localPath);
            const fileInput = await page.$('input[type="file"]#claim_answers_attributes_1_files'); // Ajusta el ID si es necesario
            if (fileInput) {
                await (fileInput as any).uploadFile(filePath );
                
            }

        }
       }catch(e){
           console.log("Error al subir el archivo", e);
        }
        await page.type('#claim_answers_attributes_2_input_date', reclamo.dateRec);
        await page.keyboard.press('Enter'); 
        // Enviar el formulario
        //await page.click('input[value="Enviar"]');
        //await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Esperar a que el formulario se envíe por completo 10 segundos
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log("Formulario enviado con éxito");

    } catch (error) {
        console.error("Error al completar el formulario:", error);
    } finally {
        await browser.close();
    }
};
