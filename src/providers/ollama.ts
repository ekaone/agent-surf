import type { AIProvider, ProviderResponse } from "../types.js";

interface OllamaResponse {
  message?: {
    content?: string;
  };
  prompt_eval_count?: number;
  eval_count?: number;
}

export function createOllamaProvider(
  baseUrl?: string,
  model?: string,
): AIProvider {
  const url = baseUrl ?? process.env["OLLAMA_HOST"] ?? "http://localhost:11434";
  const m = model ?? process.env["OLLAMA_MODEL"] ?? "llama3";

  return {
    name: "ollama",
    async generate(
      userPrompt: string,
      systemPrompt: string,
    ): Promise<ProviderResponse> {
      const res = await fetch(`${url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m,
          stream: false,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Ollama API error ${res.status}: ${err}`);
      }

      const data = (await res.json()) as OllamaResponse;
      const content = data.message?.content ?? "";

      return {
        content,
        usage: {
          inputTokens: data.prompt_eval_count ?? 0,
          outputTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
      };
    },
  };
}
