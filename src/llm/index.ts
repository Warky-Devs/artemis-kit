import { getTextCompletion } from "./openapi";
import { getClaudeCompletion } from "./claude";

export const OpenAPI = {
  getTextCompletion,
};

export const Claude = {
  getClaudeCompletion,
};

export default {
  OpenAPI,
  Claude,
};
