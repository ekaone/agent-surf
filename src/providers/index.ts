import { createClaudeProvider } from "./claude.js";
import { createOpenAIProvider } from "./openai.js";
import { createOllamaProvider } from "./ollama.js";

export { createClaudeProvider, createOpenAIProvider, createOllamaProvider };

export type ProviderName = "claude" | "openai" | "ollama";

export function createProvider(name: ProviderName = "claude") {
  switch (name) {
    case "claude":
      return createClaudeProvider();
    case "openai":
      return createOpenAIProvider();
    case "ollama":
      return createOllamaProvider();
    default:
      throw new Error(
        `Unknown provider: "${name}". Use: claude | openai | ollama`,
      );
  }
}
