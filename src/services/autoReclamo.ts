import puppeteer, { Page } from 'puppeteer';
import { Reclamo } from '~/model/Reclamo';
import { config } from '~/config';
import path from 'path';
import { obtenerReclamo } from '~/controller/reclamoController';
import logger from '../logs/logger';

export const completarFormularioOnline = async (Reclamo: string ,localPath: string): Promise<void> => {
    let url = '';
    //TO DO
    //Desde el id del reclamo buscar en bd y traer el reclamo correspondiente.
    const reclamo = await obtenerReclamo(Reclamo);
    console.log(reclamo);
    //Validacion de todos los campos
    if (!reclamo) {
        console.error("No se encontró el reclamo con el ID proporcionado.");
        logger.error("No se encontró el reclamo con el ID proporcionado.");
        return;
    }
    if (!reclamo.type) {
        console.error("El reclamo no tiene un tipo definido.");
        logger.error("El reclamo no tiene un tipo definido.");
        return;
    }
    if (!reclamo.name && reclamo.id != '7c476c35-5f8a-41ce-9930-da81a1a51bf3') {
        console.error("El reclamo no tiene un nombre definido.");
        logger.error("El reclamo no tiene un nombre definido.");
        return;
    }
    if (!reclamo.lastname) {
        console.error("El reclamo no tiene un apellido definido.");
        logger.error("El reclamo no tiene un apellido definido.");
        return;
    }
    if (!reclamo.docType) {
        console.error("El reclamo no tiene un tipo de documento definido.");
        logger.error("El reclamo no tiene un tipo de documento definido.");
        return;
    }
    if (!reclamo.docNumber) {
        console.error("El reclamo no tiene un número de documento definido.");
        logger.error("El reclamo no tiene un número de documento definido.");
        return;
    }
    if (!reclamo.phone) {
        console.error("El reclamo no tiene un número de teléfono definido.");
        logger.error("El reclamo no tiene un número de teléfono definido.");
        return;
    }
    if (!reclamo.email) {
        console.error("El reclamo no tiene un correo electrónico definido.");
        logger.error("El reclamo no tiene un correo electrónico definido.");
        return;
    }
    if (!reclamo.address) {
        console.error("El reclamo no tiene una dirección definida.");
        logger.error("El reclamo no tiene una dirección definida.");
        return;
    }
    if (!reclamo.direcNum) {
        console.error("El reclamo no tiene un número de dirección definido.");
        logger.error("El reclamo no tiene un número de dirección definido.");
        return;
    }
    if (!reclamo.descriptionRec) {
        console.error("El reclamo no tiene una descripción definida.");
        logger.error("El reclamo no tiene una descripción definida.");
        return;
    }
    if (!reclamo.dateRec) {
        console.error("El reclamo no tiene una fecha definida.");
        logger.error("El reclamo no tiene una fecha definida.");
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
                logger.info(`Intento ${attempts + 1} de ${maxAttempts} para acceder a la URL: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle2' });
                success = true;
                console.log("Formulario cargado exitosamente.");
                logger.info("Formulario cargado exitosamente.");
            } catch (error) {
                console.error(`Error al intentar cargar la URL en el intento ${attempts + 1}:`, error);
                logger.error(`Error al intentar cargar la URL en el intento ${attempts + 1}:`, error);
                attempts++;
                if (attempts < maxAttempts) {
                    console.log("Reintentando en 30 segundos...");
                    logger.info("Reintentando en 30 segundos...");
                    await new Promise(resolve => setTimeout(resolve, 30000));
                } else {
                    console.error("No se pudo cargar la URL después de varios intentos.");
                    logger.error("No se pudo cargar la URL después de varios intentos.");
                    throw new Error("Error al cargar la URL después de varios intentos.");
                }
            }
        }

        // Completar cada campo del formulario usando IDs secuenciales
        try {
            const camposAVerificar = [
                { selector: '#person_name', valor: reclamo.name, nombre: 'nombre' },
                { selector: '#person_flastname', valor: reclamo.lastname, nombre: 'apellido' },
                { selector: '#person_identifier_type', valor: reclamo.docType, nombre: 'tipo documento', esSelect: true },
                { selector: '#person_identifier', valor: reclamo.docNumber, nombre: 'documento' },
                { selector: '#person_phone', valor: reclamo.phone, nombre: 'teléfono' },
                { selector: '#person_email', valor: reclamo.email, nombre: 'email' },
                { selector: '#address_street', valor: reclamo.address, nombre: 'dirección' },
                { selector: '#address_number', valor: reclamo.direcNum, nombre: 'número' },
                { selector: '#address_floor', valor: reclamo.piso, nombre: 'piso' },
                { selector: '#address_apartment', valor: reclamo.dpto, nombre: 'departamento' }
            ];
        
            for (const campo of camposAVerificar) {
                if (campo.esSelect) {
                    await page.select(campo.selector, campo.valor);
                } else {
                    const verificado = await verificarCampoFormulario(
                        page,
                        campo.selector,
                        campo.valor,
                        campo.nombre
                    );
        
                    if (!verificado) {
                        throw new Error(`No se pudo verificar el campo ${campo.nombre}`);
                    }
                }
            }
        
            console.log('✅ Todos los campos fueron verificados correctamente');
            logger.info('✅ Todos los campos fueron verificados correctamente');
            await page.click('input[value="Siguiente"]');
            
        } catch (error) {
            console.error('❌ Error en la verificación de campos:', error);
            logger.error('❌ Error en la verificación de campos:', error);
            throw error;
        }
        //await page.type('#address_references', "Referencias para identificar la direccion especificada."); // Referencias
        //await new Promise(resolve => setTimeout(resolve, 2000));
        // Hacer clic en el botón "Siguiente"
        //await page.click('input[value="Siguiente"]'); // Ajusta el selector si es necesario
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Completar la segunda sección
        await page.type('#claim_answers_attributes_0_input_text', reclamo.descriptionRec); // Descripción del reclamo
        //Adjuntar un archivo si es necesario
        // Reemplaza con la ruta real del archivo si tienes uno
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
           logger.error("Error al subir el archivo", e);
        }
        await page.type('#claim_answers_attributes_2_input_date', reclamo.dateRec);
        await page.keyboard.press('Enter'); 
        // Enviar el formulario
        //await page.click('input[value="Enviar"]');
        //await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Esperar a que el formulario se envíe por completo 10 segundos
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log("Formulario enviado con éxito");
        logger.info("Formulario enviado con éxito");

    } catch (error) {
        console.error("Error al completar el formulario:", error);
        logger.error("Error al completar el formulario:", error);
    } finally {
        await browser.close();
    }
};

async function verificarCampoFormulario(
    page: Page, 
    selector: string, 
    valorEsperado: string, 
    nombreCampo: string,
    maxIntentos: number = 3
): Promise<boolean> {
    let intentos = 0;
    while (intentos < maxIntentos) {
        try {
            // Esperar a que el elemento esté presente y sea visible
            await page.waitForSelector(selector, { 
                visible: true, 
                timeout: 5000 
            });
            
            // Limpiar el campo antes de escribir
            await page.$eval(selector, (el) => (el as HTMLInputElement).value = '');
            
            // Escribir el valor con un pequeño delay entre caracteres
            await page.type(selector, valorEsperado, { delay: 50 });
            
            // Esperar un momento para que el valor se establezca
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Obtener y verificar el valor actual
            const valorActual = await page.$eval(selector, (el) => (el as HTMLInputElement).value);
            
            if (valorActual.trim() === valorEsperado.trim()) {
                console.log(`✅ Campo ${nombreCampo} verificado correctamente: "${valorActual}"`);
                logger.info(`✅ Campo ${nombreCampo} verificado correctamente: "${valorActual}"`);
                return true;
            }
            
            console.log(`⚠️ Intento ${intentos + 1}: Valor actual "${valorActual}" no coincide con esperado "${valorEsperado}"`);
            logger.warn(`⚠️ Intento ${intentos + 1}: Valor actual "${valorActual}" no coincide con esperado "${valorEsperado}"`);
            intentos++;
            
            if (intentos < maxIntentos) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.error(`❌ Error al verificar ${nombreCampo} (Intento ${intentos + 1}):`, error);
            logger.error(`❌ Error al verificar ${nombreCampo} (Intento ${intentos + 1}):`, error);
            intentos++;
            
            if (intentos === maxIntentos) {
                console.error(`🚫 Máximo de intentos alcanzado para ${nombreCampo}`);
                logger.error(`🚫 Máximo de intentos alcanzado para ${nombreCampo}`);
                return false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return false;
}
