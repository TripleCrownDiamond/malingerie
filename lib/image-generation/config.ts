import { z } from "zod";

export const imageModels = {
  gptImage2: {
    id: "gpt-image-2",
    endpointPath: "/v1/images",
    defaultSize: "1536x1024",
    defaultQuality: "medium",
  },
  flux: {
    id: "flux",
    endpointPath: "/v1/images/flux",
    defaultSize: "1024x1024",
    defaultQuality: "medium",
  },
} as const;

export const imageGenerationSchema = z.object({
  prompt: z.string().min(12, "Le prompt doit contenir au moins 12 caracteres."),
  model: z.enum(["gpt-image-2", "flux"]).default("gpt-image-2"),
  size: z
    .enum(["1024x1024", "1280x720", "720x1280", "1536x1024", "1024x1536"])
    .optional(),
  quality: z.enum(["low", "medium", "high"]).optional(),
  width: z.number().int().min(256).max(1024).optional(),
  height: z.number().int().min(256).max(1024).optional(),
  steps: z.number().int().min(4).max(50).optional(),
});

export type ImageGenerationInput = z.infer<typeof imageGenerationSchema>;

export function getImageProviderConfig() {
  return {
    baseUrl: process.env.IMAGE_API_BASE_URL ?? "https://build.lewisnote.com",
    apiKey: process.env.IMAGE_API_KEY,
  };
}
