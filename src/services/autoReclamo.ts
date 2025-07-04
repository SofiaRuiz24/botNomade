import axios from "axios";
import * as cheerio from "cheerio";
import qs from "qs";
import { Reclamo } from "~/model/Reclamo";
import { config } from "~/config";
import path from "path";
import { fileURLToPath } from "url";
import { obtenerReclamo } from "~/controller/reclamoController";
import logger from "../logs/logger";
import fs from "fs";
import FormData from "form-data";

// Para ES modules, necesitamos definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const completarFormularioOnline = async (
  Reclamo: string,
  localPath: string
): Promise<void> => {
  // Desde el id del reclamo buscar en bd y traer el reclamo correspondiente.
  const reclamo = await obtenerReclamo(Reclamo);
  console.log(reclamo);

  // Validacion de todos los campos
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
  if (!reclamo.name && reclamo.id != "7c476c35-5f8a-41ce-9930-da81a1a51bf3") {
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

  // Obtener la URL base según el tipo de reclamo
  let baseUrl = "";
  switch (reclamo.type) {
    case "Reclamo: Poda de arboles":
      baseUrl = config.URL_PODA;
      break;
    case "Reclamo: Alumbrado publico":
      baseUrl = config.URL_ALUMBRADO;
      break;
    case "Reclamo: Animales Sueltos":
      baseUrl = config.URL_ANIMALES;
      break;
    case "Reclamo: Obras publicas inconclusas":
      baseUrl = config.URL_OBRAS;
      break;
    case "Reclamo: Veredas en mal estado":
      baseUrl = config.URL_VEREDAS;
      break;
    case "Reclamo: Ruidos Molestos":
      baseUrl = config.URL_RUIDOS;
      break;
    case "Reclamo: Transporte publico":
      baseUrl = config.URL_TRANSPORTE;
      break;
    case "Reclamo: Recoleccion de residuos":
      baseUrl = config.URL_RECOLECCION;
      break;
    case "Reclamo: Problemas de agua":
      baseUrl = config.URL_AGUA;
      break;
    case "Reclamo: Fuga de gas":
      baseUrl = config.URL_GAS;
      break;
    case "Reclamo: Rutas deteriorada":
      baseUrl = config.URL_RUTA;
      break;
  }

  if (!baseUrl) {
    console.error(
      "No se pudo determinar la URL para el tipo de reclamo:",
      reclamo.type
    );
    logger.error(
      "No se pudo determinar la URL para el tipo de reclamo:",
      reclamo.type
    );
    return;
  }

  try {
    await enviarFormularioConAxios(baseUrl, reclamo, localPath);
  } catch (error) {
    console.error("Error al completar el formulario:", error);
    logger.error("Error al completar el formulario:", error);
  }
};

async function enviarFormularioConAxios(
  formUrl: string,
  reclamo: any,
  localPath: string
): Promise<void> {
  let success = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!success && attempts < maxAttempts) {
    try {
      logger.info(
        `Intento ${
          attempts + 1
        } de ${maxAttempts} para acceder a la URL: ${formUrl}`
      );

      // 1. Obtener la página HTML para extraer el authenticity_token y el action del formulario
      const getResp = await axios.get(formUrl, {
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            
        },
      });

      const $ = cheerio.load(getResp.data);

      // Extraer el action del formulario primero
      const formAction = $("form").attr("action");
      if (!formAction) {
        throw new Error("No se pudo obtener el action del formulario");
      }

      // Buscar el authenticity_token específicamente dentro del formulario
      const authenticityToken = $('form input[name="authenticity_token"]').val() as string;
      if (!authenticityToken) {
        throw new Error("No se pudo obtener el authenticity_token del formulario");
      }

      // Construir la URL completa para el POST
      let actionUrl = formAction;
      if (formAction.startsWith("/")) {
        // Si es una URL relativa, construir la URL completa
        const baseUrl = new URL(formUrl);
        actionUrl = `${baseUrl.origin}${formAction}`;
      }

      logger.info("Authenticity token obtenido exitosamente");
      logger.info("Action URL extraída:", actionUrl);

      // 2. Preparar el payload del formulario
      let payload: any = {
        _method: "patch",
        authenticity_token: authenticityToken,
      };

      // Mapeo de campos basado en el formulario original
      payload = await mapearCamposFormulario(payload, reclamo, $);

      logger.info("✅ Campos mapeados correctamente");

      // 3. Manejar archivo adjunto si existe
      logger.info(`Verificando archivo adjunto. localPath:`, localPath);
      logger.info(`Tipo de localPath: ${typeof localPath}`);
      logger.info(`Sistema operativo: ${process.platform}`);
      logger.info(`Directorio de trabajo actual: ${process.cwd()}`);
      
      if (
        localPath &&
        localPath !== "" &&
        localPath !== undefined &&
        localPath !== "base-ts-meta-memory" &&
        localPath !== "base-ts-meta-memory.d.ts" &&
        localPath !== "undefined" &&
        localPath !== "base_ts_meta_memory"
      ) {
        logger.info(`Enviando formulario con archivo desde: ${localPath}`);
        await enviarFormularioConArchivo(
          actionUrl,
          payload,
          localPath,
          formUrl,
          authenticityToken
        );
      } else {
        logger.info("Enviando formulario sin archivo");
        await enviarFormularioSinArchivo(actionUrl, payload, formUrl, authenticityToken);
      }

      success = true;
      logger.info("Formulario enviado con éxito");
    } catch (error: any) {
      console.error(
        `Error al intentar enviar formulario en el intento ${attempts + 1}:`,
        error.message
      );
      logger.error(
        `Error al intentar enviar formulario en el intento ${attempts + 1}:`,
        error.message
      );
      attempts++;

      if (attempts < maxAttempts) {
        console.log("Reintentando en 30 segundos...");
        logger.info("Reintentando en 30 segundos...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
      } else {
        console.error(
          "No se pudo enviar el formulario después de varios intentos."
        );
        logger.error(
          "No se pudo enviar el formulario después de varios intentos."
        );
        throw new Error(
          "Error al enviar el formulario después de varios intentos."
        );
      }
    }
  }
}

async function mapearCamposFormulario(
  payload: any,
  reclamo: any,
  $: any
): Promise<any> {
  // Analizar la estructura del formulario para obtener los nombres correctos de los campos
  // Esta función mapea los campos del reclamo a los nombres esperados por el formulario

  // Intentar encontrar los nombres de los campos analizando el HTML
  const nameField = $('input[name*="name"], input[id*="name"]')
    .first()
    .attr("name");
  const lastnameField = $(
    'input[name*="lastname"], input[name*="flastname"], input[id*="lastname"]'
  )
    .first()
    .attr("name");
  const docTypeField = $(
    'select[name*="identifier_type"], select[id*="identifier_type"]'
  )
    .first()
    .attr("name");
  const docNumberField = $('input[name*="identifier"], input[id*="identifier"]')
    .first()
    .attr("name");
  const emailField = $('input[name*="email"], input[id*="email"]')
    .first()
    .attr("name");
  const phoneField = $('input[name*="phone"], input[id*="phone"]')
    .first()
    .attr("name");
  const addressField = $(
    'input[name*="street"], input[id*="street"], input[name*="address"]'
  )
    .first()
    .attr("name");
  const numberField = $('input[name*="number"], input[id*="number"]')
    .first()
    .attr("name");
  const floorField = $(
    'input[name*="floor"], input[id*="floor"], input[name*="piso"]'
  )
    .first()
    .attr("name");
  const aptField = $(
    'input[name*="apartment"], input[id*="apartment"], input[name*="dpto"]'
  )
    .first()
    .attr("name");

  // Mapear campos de persona/vecino
  if (nameField) payload[nameField] = reclamo.name;
  if (lastnameField) payload[lastnameField] = reclamo.lastname;
  if (docTypeField) payload[docTypeField] = reclamo.docType;
  if (docNumberField) payload[docNumberField] = reclamo.docNumber;
  if (emailField) payload[emailField] = reclamo.email;
  if (phoneField) payload[phoneField] = reclamo.phone;

  // Mapear campos de dirección
  if (addressField) payload[addressField] = reclamo.address;
  if (numberField) payload[numberField] = reclamo.direcNum;
  if (floorField && reclamo.piso) payload[floorField] = reclamo.piso;
  if (aptField && reclamo.dpto) payload[aptField] = reclamo.dpto;

  // Buscar campos de descripción y fecha
  const descriptionField = $('textarea[name*="text"], input[name*="text"]')
    .first()
    .attr("name");
  const dateField = $('input[name*="date"], input[id*="date"]')
    .first()
    .attr("name");

  if (descriptionField) payload[descriptionField] = reclamo.descriptionRec;
  if (dateField) payload[dateField] = reclamo.dateRec;

  // Buscar y agregar question_ids si existen
  $('input[name*="question_id"]').each((i, elem) => {
    const questionIdField = $(elem).attr("name");
    const questionIdValue = $(elem).val();
    if (questionIdField && questionIdValue) {
      payload[questionIdField] = questionIdValue;
    }
  });

  // Mapeo alternativo usando la estructura de answers_attributes
  const answerFields = $(
    'input[name*="answers_attributes"], select[name*="answers_attributes"], textarea[name*="answers_attributes"]'
  );

  if (answerFields.length > 0) {
    logger.info("🔍 Extrayendo question_ids dinámicamente del HTML...");

    // Extraer question_ids dinámicamente del HTML
    const questionIds: { [key: number]: string } = {};
    
    // Buscar todos los inputs hidden con question_id
    $('input[name*="question_id"][type="hidden"]').each((i, elem) => {
      const nameAttr = $(elem).attr("name");
      const value = $(elem).val() as string;
      
      if (nameAttr && value) {
        // Extraer el índice del nombre: claim[answers_attributes][X][question_id]
        const match = nameAttr.match(/claim\[answers_attributes\]\[(\d+)\]\[question_id\]/);
        if (match) {
          const index = parseInt(match[1]);
          questionIds[index] = value;
          logger.info(`📋 question_id[${index}] = ${value}`);
        }
      }
    });

    // Si encontramos campos con answers_attributes, usar esa estructura
    payload["claim[answers_attributes][0][neighbor_attributes][name]"] =
      reclamo.name;
    payload["claim[answers_attributes][0][neighbor_attributes][flastname]"] =
      reclamo.lastname;
    payload[
      "claim[answers_attributes][0][neighbor_attributes][identifier_type]"
    ] = reclamo.docType;
    payload["claim[answers_attributes][0][neighbor_attributes][identifier]"] =
      reclamo.docNumber;
    payload["claim[answers_attributes][0][neighbor_attributes][email]"] =
      reclamo.email;
    payload["claim[answers_attributes][0][neighbor_attributes][phone]"] =
      reclamo.phone;

    // Usar question_ids extraídos dinámicamente
    if (questionIds[0]) {
      payload["claim[answers_attributes][0][question_id]"] = questionIds[0];
      logger.info(`✅ Asignado question_id[0]: ${questionIds[0]}`);
    }

    // Calle (índice 1)
    payload["claim[answers_attributes][1][input_string]"] = reclamo.address;
    if (questionIds[1]) {
      payload["claim[answers_attributes][1][question_id]"] = questionIds[1];
      logger.info(`✅ Asignado question_id[1]: ${questionIds[1]}`);
    }

    // Número (índice 2)
    payload["claim[answers_attributes][2][input_string]"] = reclamo.direcNum;
    if (questionIds[2]) {
      payload["claim[answers_attributes][2][question_id]"] = questionIds[2];
      logger.info(`✅ Asignado question_id[2]: ${questionIds[2]}`);
    }

    // Piso/Dto (índice 3) - opcional
    if (reclamo.piso) {
      payload["claim[answers_attributes][3][input_string]"] = reclamo.piso;
    }
    if (questionIds[3]) {
      payload["claim[answers_attributes][3][question_id]"] = questionIds[3];
      logger.info(`✅ Asignado question_id[3]: ${questionIds[3]}`);
    }

    // Localidad (índice 4) - opcional, usar dpto del reclamo
    if (reclamo.dpto) {
      payload["claim[answers_attributes][4][input_string]"] = reclamo.dpto;
    }
    if (questionIds[4]) {
      payload["claim[answers_attributes][4][question_id]"] = questionIds[4];
      logger.info(`✅ Asignado question_id[4]: ${questionIds[4]}`);
    }

    // Referencias (índice 5) - opcional
    if (reclamo.referencias) {
      payload["claim[answers_attributes][5][input_string]"] = reclamo.referencias;
    }
    if (questionIds[5]) {
      payload["claim[answers_attributes][5][question_id]"] = questionIds[5];
      logger.info(`✅ Asignado question_id[5]: ${questionIds[5]}`);
    }

    // Descripción del reclamo (índice 6)
    payload["claim[answers_attributes][6][input_text]"] = reclamo.descriptionRec;
    if (questionIds[6]) {
      payload["claim[answers_attributes][6][question_id]"] = questionIds[6];
      logger.info(`✅ Asignado question_id[6]: ${questionIds[6]}`);
    }

    // Archivos (índice 7) - se maneja en enviarFormularioConArchivo
    if (questionIds[7]) {
      payload["claim[answers_attributes][7][question_id]"] = questionIds[7];
      logger.info(`✅ Asignado question_id[7]: ${questionIds[7]}`);
    }

    // Fecha (índice 8) - mantener formato original con barras /
    logger.info(`📅 Fecha original recibida: "${reclamo.dateRec}"`);
    payload["claim[answers_attributes][8][input_date]"] = reclamo.dateRec;
    if (questionIds[8]) {
      payload["claim[answers_attributes][8][question_id]"] = questionIds[8];
      logger.info(`✅ Asignado question_id[8]: ${questionIds[8]}`);
    }
    logger.info(`📅 Fecha enviada al formulario: "${payload["claim[answers_attributes][8][input_date]"]}"`);

    // Log resumen de question_ids encontrados
    logger.info(`📊 Resumen de question_ids extraídos:`, questionIds);
  }

  logger.info("Campos mapeados en el payload:", Object.keys(payload));
  return payload;
}

async function enviarFormularioSinArchivo(
  formUrl: string,
  payload: any,
  refererUrl: string,
  authenticityToken: string
): Promise<void> {
  console.log("Enviando formulario a:", formUrl);
  console.log("Payload:", payload);
  const postResp = await axios.post(formUrl, qs.stringify(payload), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: refererUrl,
      "X-CSRF-Token": authenticityToken,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
    maxRedirects: 0,
    validateStatus: (status) => status < 400,
    timeout: 30000,
  });

  logger.info(
    "Formulario enviado sin archivo. Código de estado:",
    postResp.status
  );
}

async function enviarFormularioConArchivo(
  formUrl: string,
  payload: any,
  localPath: string,
  refererUrl: string,
  authenticityToken: string
): Promise<void> {
  try {
    logger.info(`🔍 Iniciando envío con archivo. Ruta recibida: ${localPath}`);

    // Función auxiliar para buscar el archivo
    const buscarArchivo = (rutaOriginal: string): string | null => {
      const fileName = path.basename(rutaOriginal);
      logger.info(`📁 Buscando archivo: ${fileName}`);

      const rutasAProbar = [
        // Ruta original tal como viene
        rutaOriginal,
        // Ruta absoluta si es relativa
        path.isAbsolute(rutaOriginal) ? rutaOriginal : path.resolve(process.cwd(), rutaOriginal),
        // En assets/tmp desde el directorio actual
        path.join(process.cwd(), 'assets', 'tmp', fileName),
        // Relativo a assets/tmp
        path.join('./assets/tmp/', fileName),
        // Desde el directorio del script
        path.join(__dirname, '../../assets/tmp/', fileName),
        // Sin la barra inicial si la tiene
        rutaOriginal.startsWith('/') ? path.resolve(process.cwd(), rutaOriginal.substring(1)) : null
      ].filter(Boolean); // Filtrar valores null

      logger.info(`🔍 Rutas a probar (${rutasAProbar.length}):`);
      rutasAProbar.forEach((ruta, index) => {
        logger.info(`  ${index + 1}. ${ruta}`);
      });

      for (const ruta of rutasAProbar) {
        try {
          const rutaNormalizada = path.resolve(ruta);
          logger.info(`🔎 Verificando: ${rutaNormalizada}`);
          
          if (fs.existsSync(rutaNormalizada)) {
            // Verificar también que se pueda leer
            fs.accessSync(rutaNormalizada, fs.constants.R_OK);
            logger.info(`✅ Archivo encontrado y legible: ${rutaNormalizada}`);
            return rutaNormalizada;
          } else {
            logger.info(`❌ No encontrado: ${rutaNormalizada}`);
          }
        } catch (error) {
          logger.warn(`⚠️ Error al verificar ${ruta}:`, error.message);
        }
      }

      return null;
    };

    // Buscar el archivo
    const archivoEncontrado = buscarArchivo(localPath);

    if (!archivoEncontrado) {
      // Intentar listar el contenido del directorio para debug
      logger.warn(`❌ Archivo no encontrado. Listando directorios para debug...`);
      
      const directoriosAListar = [
        path.join(process.cwd(), 'assets', 'tmp'),
        path.join(process.cwd(), 'assets'),
        path.dirname(localPath)
      ];

      for (const dir of directoriosAListar) {
        try {
          if (fs.existsSync(dir)) {
            const archivos = fs.readdirSync(dir);
            logger.info(`📂 Contenido de ${dir}:`, archivos);
          } else {
            logger.warn(`📂 Directorio no existe: ${dir}`);
          }
        } catch (error) {
          logger.error(`❌ Error al listar ${dir}:`, error.message);
        }
      }

      logger.warn(`🚫 No se pudo encontrar el archivo. Enviando formulario sin archivo.`);
      await enviarFormularioSinArchivo(formUrl, payload, refererUrl, authenticityToken);
      return;
    }

    logger.info(`📤 Preparando envío con archivo: ${archivoEncontrado}`);

    const formData = new FormData();

    // Agregar todos los campos del payload al FormData
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });

    // Crear stream del archivo
    const fileStream = fs.createReadStream(archivoEncontrado);
    
    // Manejar errores del stream
    fileStream.on('error', (streamError) => {
      logger.error(`❌ Error al crear stream del archivo:`, streamError);
    });

    // Agregar el archivo al formulario
    formData.append("claim[answers_attributes][7][files][]", fileStream);

    logger.info(`🚀 Enviando formulario con archivo...`);

    const postResp = await axios.post(formUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        Referer: refererUrl,
        "X-CSRF-Token": authenticityToken,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      maxRedirects: 0,
      validateStatus: (status) => status < 400,
      timeout: 60000, // Más tiempo para archivos
    });

    logger.info(
      "✅ Formulario enviado con archivo. Código de estado:",
      postResp.status
    );
  } catch (error) {
    logger.error("❌ Error al subir el archivo:", error);
    logger.info("🔄 Intentando enviar formulario sin archivo...");
    await enviarFormularioSinArchivo(formUrl, payload, refererUrl, authenticityToken);
  }
}
