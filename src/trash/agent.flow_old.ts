import { addKeyword } from "@builderbot/bot";
import delay from "../utils/delay";
import moment from "moment-timezone";
import { blackListFlow } from "../flows/blackList.flow";

/**
 * Función para crear un grupo y enviar un mensaje de invitación
 */
async function createGroupAndSendMessage(refAgentProvider, id, ctx) {
  const horaActual = moment().tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY HH:mm:ss");
  // Crear el grupo
  const group = await refAgentProvider.groupCreate("Grupo agente AquaDreams", [id, process.env.WHATSAPP_ADMIN]);
  console.log('id', id);
  const gID = group.id;
  console.log("gID:", gID);

  // Obtener el código de invitación
  const code = await refAgentProvider.groupInviteCode(gID); // Corregido aquí
  await delay(1000); // Pequeño delay para asegurar que el código se genere

  // Preparar los datos del usuario
  const userData = {
    phone: ctx.from,
    code: code,
    created: horaActual,
  };

  // Guardar los datos en la hoja de cálculo (comentado por ahora)
  // await spreadsheetConnection(4, userData);

  // Enviar mensaje al grupo
  const message = {
    text: `ahora puede escribirnos en este grupo para hablar con nuestro personal`,
  };
  await refAgentProvider.sendMessage(gID, message);

  return gID;
}

/**
 * Flujo principal para manejar la interacción con el agente
 */
const flowAgente = addKeyword(["agente", "Agente", "Ag", "AGENTE"], {
  sensitive: true,
}).addAnswer(
  ["Un momento porfavor..."],
  { delay: 2000 },
  async (ctx, { provider, flowDynamic,gotoFlow, endFlow }) => {
    try {
      const id = ctx.key.remoteJid;
      const refAgentProvider = await provider.getInstance();
      const getUsersGroups = []; // Simulación de datos (reemplazar con la conexión real a la hoja de cálculo)

      // Buscar si el usuario ya tiene un grupo creado
      const usersGroups = getUsersGroups.find((obj) => obj.celulares === ctx.from);

      if (!usersGroups) {
        // Crear un nuevo grupo y enviar mensaje de invitación
        const gID = await createGroupAndSendMessage(refAgentProvider, id, ctx);
        await flowDynamic(`Le hemos agregado a un grupo con nuestro personal!`);
      } else {
        // Notificar al usuario que ya tiene un grupo creado   
        await flowDynamic(
          `Ya tiene un grupo creado y es: \nhttps://chat.whatsapp.com/${usersGroups.enlace}`
        );
      }
          // Redirigir al flujo blacklistFlow al final
          // return gotoFlow(blackListFlow);
    } catch (error) {
      console.error("Error en el flujo de agente:", error);
      await flowDynamic("Hubo un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.");
      return endFlow();
    }
  }
);
export default flowAgente;