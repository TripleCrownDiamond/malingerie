import { imageGenerationSchema, type ImageGenerationInput, getImageProviderConfig } from "@/lib/image-generation/config";

export type GeneratedImagePayload = {
  url: string;
  revisedPrompt?: string;
  provider: string;
  model: string;
};

function tryExtractUrl(payload: unknown): { url?: string; b64?: string; revisedPrompt?: string } {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const raw = payload as Record<string, unknown>;

  if (typeof raw.url === "string") {
    return { url: raw.url, revisedPrompt: typeof raw.revised_prompt === "string" ? raw.revised_prompt : undefined };
  }

  if (Array.isArray(raw.data) && raw.data.length > 0) {
    const first = raw.data[0] as Record<string, unknown>;
    return {
      url: typeof first.url === "string" ? first.url : undefined,
      b64: typeof first.b64_json === "string" ? first.b64_json : undefined,
      revisedPrompt: typeof first.revised_prompt === "string" ? first.revised_prompt : undefined,
    };
  }

  return {};
}

export async function generateImage(input: ImageGenerationInput): Promise<GeneratedImagePayload> {
  const parsed = imageGenerationSchema.parse(input);
  const provider = getImageProviderConfig();

  if (!provider.apiKey) {
    throw new Error("IMAGE_API_KEY est manquante.");
  }

  const endpoint = parsed.model === "flux" ? `${provider.baseUrl}/v1/images/flux` : `${provider.baseUrl}/v1/images`;

  const body =
    parsed.model === "flux"
      ? {
          prompt: parsed.prompt,
          width: parsed.width ?? 1024,
          height: parsed.height ?? 1024,
          steps: parsed.steps ?? 25,
        }
      : {
          model: parsed.model,
          prompt: parsed.prompt,
          size: parsed.size ?? "1536x1024",
          quality: parsed.quality ?? "medium",
        };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generation echouee (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as unknown;
  const extraction = tryExtractUrl(payload);

  if (extraction.url) {
    return {
      url: extraction.url,
      revisedPrompt: extraction.revisedPrompt,
      provider: provider.baseUrl,
      model: parsed.model,
    };
  }

  if (extraction.b64) {
    return {
      url: `data:image/png;base64,${extraction.b64}`,
      revisedPrompt: extraction.revisedPrompt,
      provider: provider.baseUrl,
      model: parsed.model,
    };
  }

  throw new Error("Aucune image exploitable retournee par le provider.");
}
