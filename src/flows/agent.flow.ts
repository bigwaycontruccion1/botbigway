import { addKeyword } from "@builderbot/bot";
import delay from "../utils/delay";
import moment from "moment-timezone";
import { blackListFlow, SelfBlackListFlow } from "./blackList.flow";


/**
 * Flujo principal para manejar la interacción con el agente
 */
const flowAgente = addKeyword(["agente", "Agente", "Ag", "AGENTE"], {
  sensitive: true,
}).addAnswer(
  ["Un momento porfavor... pronto te contactará un agente"],
  { delay: 2000 },
  async (ctx, { provider, flowDynamic, gotoFlow, endFlow }) => {
    try {
     return  gotoFlow(SelfBlackListFlow);
    
    } catch (error) {
      
      return endFlow();
    }
  }
);
export default flowAgente;