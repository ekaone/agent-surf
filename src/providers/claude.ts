import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ProviderResponse } from "../types.js";

export function createClaudeProvider(
  apiKey?: string,
  model = "claude-sonnet-4-6",
): AIProvider {
  const key = apiKey ?? process.env["ANTHROPIC_API_KEY"];
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set.");

  const client = new Anthropic({ apiKey: key });

  return {
    name: "claude",
    async generate(
      userPrompt: string,
      systemPrompt: string,
    ): Promise<ProviderResponse> {
      const message = await client.messages.create({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const block = message.content[0];
      if (!block || block.type !== "text")
        throw new Error("Unexpected response type from Claude");

      return {
        content: block.text,
        usage: {
          inputTokens: message.usage?.input_tokens ?? 0,
          outputTokens: message.usage?.output_tokens ?? 0,
          totalTokens:
            (message.usage?.input_tokens ?? 0) +
            (message.usage?.output_tokens ?? 0),
        },
      };
    },
  };
}
