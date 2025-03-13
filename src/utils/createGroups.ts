// import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
// import { MemoryDB as Database } from '@builderbot/bot';
// import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
// import { config } from 'dotenv';
// config();

// const PHONE_NUMBER = process.env.PHONE_NUMBER;
// const PORT = process.env.PORT ?? 3008;
// let contacts: Record<string, any> = {};

// // Crear el proveedor
// const adapterProvider = createProvider(Provider, {
//     // Opciones de configuración del proveedor (si las tienes)
// });

// // Crear una instancia de la base de datos
// const adapterDB = new Database();

// // Crear el flujo para interactuar con grupos
// const groupFlow = addKeyword<Provider, Database>("CONECTAR", { sensitive: true })
//     .addAnswer(`¡Bienvenido! Estos son los grupos detectados:`)
//     .addAction(async (_, { flowDynamic, provider }) => {
//         // Filtrar solo los grupos (IDs que contienen "@g")
//         const groups = Object.entries(contacts)
//             .filter(([id]) => id.includes('@g'))
//             .map(([id, data]) => ({ id, name: data?.name || 'Sin nombre' }));

//         // Crear un mensaje con los IDs y nombres de los grupos
//         const groupMessages: string[] = [];
//         for (const group of groups) {
//             groupMessages.push(`Nombre del grupo: ${group.name}\nID del grupo: ${group.id}`);

//             // Enviar el mensaje "Robot en conexión" a cada grupo usando el método correcto
//             try {
//                 await provider.sendMessage(group.id, ´{ text: ' Robot en conexión' }´);
//                 console.log(`Mensaje enviado al grupo: ${group.name}`);
//             } catch (error) {
//                 console.error(`Error al enviar mensaje al grupo ${group.name}:`, error);
//             }
//         }

//         const concatenatedMessages = groupMessages.join('\n\n');
//         await flowDynamic(concatenatedMessages || 'No se encontraron grupos.');
//     });

// // Función para crear un grupo y enviar un mensaje
// async function createGroupAndSendMessage() {
//     try {
//         // Obtener la instancia del proveedor
//         const providerInstance = adapterProvider.getInstance();

//         // Crear un grupo manualmente
//         const group = await providerInstance.sock.groupCreate("El grupo bueno", [
//             "XXXXXXXXXXXX@s.whatsapp.net", // Reemplaza con números de teléfono válidos
//             "XXXXXXXXXXXXX@s.whatsapp.net" // Reemplaza con números de teléfono válidos
//         ]);

//         console.log("Grupo creado con ID:", group.id);

//         // Enviar un mensaje al grupo
//         await providerInstance.sendMessage(group.id, { text: '¡Hola a todos! Este es un nuevo grupo.' });
//         console.log("Mensaje enviado al grupo:", group.id);
//     } catch (error) {
//         console.error("Error al crear el grupo o enviar el mensaje:", error);
//     }
// }

// // Crear el bot
// const main = async () => {
//     const { handleCtx, httpServer } = await createBot({
//         flow: createFlow([groupFlow]),
//         database: adapterDB,
//         provider: adapterProvider,
//         config: {
//             port: PORT,
//         },
//     });

//     httpServer.listen(PORT, () => {
//         console.log(`Bot escuchando en el puerto ${PORT}`);
//     });
// };

// // Llamar a la función para crear el grupo y enviar el mensaje
// createGroupAndSendMessage();

// // Iniciar el bot
// main();

