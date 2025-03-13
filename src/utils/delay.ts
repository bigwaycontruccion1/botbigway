/**
 * Función para pausar la ejecución por un tiempo determinado.
 * @param {number} ms - Tiempo en milisegundos.
 * @returns {Promise<void>} - Una promesa que se resuelve después del tiempo especificado.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default delay;