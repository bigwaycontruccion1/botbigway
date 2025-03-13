import { createFlow } from "@builderbot/bot";

//  import { welcomeFlow } from "./welcome.flow";
// import { flowSeller } from "./seller.flow";
// import { flowConfirm } from "./confirm.flow";
import { flowContract } from "./contract.flow";
import welcomeFlow from "./welcome.flow";

/**
 * Declaramos todos los flujos que vamos a utilizar
 */
export default createFlow([welcomeFlow,  flowContract])