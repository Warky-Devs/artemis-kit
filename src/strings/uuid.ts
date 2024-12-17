import { v4 as uuidv4 } from "uuid";
/**
 * Generates a UUID (Universally Unique Identifier) using the crypto.randomUUID() method if available,
 * or creates a fallback UUID using the current timestamp and random numbers.
 *
 * @returns {string} Returns a UUID string.
 */
export function getUUID(): string {
  let uuid = "";
  try {
    uuid = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    const d = new Date();
    const rnd = Math.random() * 100 * (Math.random() * 10);
    uuid = `${d.getTime()}${rnd}`;
  }
  return uuid;
}

/**
 * Generates a random UUID using the uuidv4 library.
 *
 * @returns {string} Returns a UUID string.
 */
export function newUUID(): string {
  return uuidv4();
}
