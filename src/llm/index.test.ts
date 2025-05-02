import { describe, it, expect } from "vitest";
import { OpenAPI, Claude } from "./index";

describe("LLM Module", () => {
  describe("OpenAPI", () => {
    it("should export getTextCompletion", () => {
      expect(OpenAPI.getTextCompletion).toBeDefined();
      expect(typeof OpenAPI.getTextCompletion).toBe("function");
    });
  });

  describe("Claude", () => {
    it("should export getClaudeCompletion", () => {
      expect(Claude.getClaudeCompletion).toBeDefined();
      expect(typeof Claude.getClaudeCompletion).toBe("function");
    });
  });
});