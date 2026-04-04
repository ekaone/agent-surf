import OpenAI from "openai";
import type { AIProvider, ProviderResponse } from "../types.js";

export function createOpenAIProvider(
  apiKey?: string,
  model = "gpt-4o",
): AIProvider {
  const key = apiKey ?? process.env["OPENAI_API_KEY"];
  if (!key) throw new Error("OPENAI_API_KEY is not set.");

  const client = new OpenAI({ apiKey: key });

  return {
    name: "openai",
    async generate(
      userPrompt: string,
      systemPrompt: string,
    ): Promise<ProviderResponse> {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0,
      });

      const content = response.choices?.[0]?.message?.content ?? "";

      return {
        content,
        usage: {
          inputTokens: response.usage?.prompt_tokens ?? 0,
          outputTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
      };
    },
  };
}
