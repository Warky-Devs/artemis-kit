import { MimeTypeList } from "./mime";

/**
 * Gets file extension from MIME type, with substring matching
 * @param pMime - MIME type string (e.g. "image/jpeg")
 * @returns First matching extension or empty string if not found
 */
export const getExtFromMime = (pMime?: string): string => {
  if (!pMime) return "";
  const mime = pMime.toLowerCase().trim();

  // Try exact match first
  const exactMatch = MimeTypeList[mime]?.extensions?.[0];
  if (exactMatch) return exactMatch;

  // Try substring match
  const keys = Object.keys(MimeTypeList);
  for (const key of keys) {
    if (key.includes(mime) || mime.includes(key)) {
      return MimeTypeList[key]?.extensions?.[0] ?? "";
    }
  }

  return "";
};

/**
 * Gets the file extension from a filename
 * @param pFilename - Name of file including extension
 * @returns Extension without dot or empty string if no extension
 */
export const getExtFromFilename = (pFilename: string): string => {
  if (!pFilename) return "";
  const parts = pFilename.trim().split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

/**
 * Gets the MIME type for a file extension
 * @param pExt - File extension with or without dot
 * @returns MIME type string or empty string if not found
 */
export const getMimeFromExt = (pExt: string): string => {
  if (!pExt) return "";
  pExt = pExt.replace(".", "");
  const keys = Object.keys(MimeTypeList);
  for (let i = 0; i < keys.length; i += 1) {
    const mime = MimeTypeList[keys[i]]?.extensions?.find(
      (v: string) => v.toLowerCase() === pExt.toLowerCase()
    );
    if (mime && mime !== "") {
      return keys[i];
    }
  }
  return "";
};

/**
 * Checks if a file extension is valid for a given MIME type
 * @param pMime - MIME type string
 * @param pExt - File extension to check
 * @returns boolean indicating if extension matches MIME type
 */
export const isValidExtForMime = (pMime: string, pExt: string): boolean => {
  if (!pMime || !pExt) return false;
  const mime = pMime.toLowerCase().trim();
  const ext = pExt.replace(".", "").toLowerCase().trim();
  return MimeTypeList[mime]?.extensions?.includes(ext) ?? false;
};

/**
 * Gets all valid extensions for a MIME type
 * @param pMime - MIME type string
 * @returns Array of valid extensions or empty array if none found
 */
export const getAllExtensionsForMime = (pMime: string): string[] => {
  if (!pMime) return [];
  const mime = pMime.toLowerCase().trim();
  return MimeTypeList[mime]?.extensions ?? [];
};
