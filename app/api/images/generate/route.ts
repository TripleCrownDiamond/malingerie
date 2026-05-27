import { NextResponse } from "next/server";
import { z } from "zod";

import { generateImage } from "@/lib/image-generation/client";
import { imageGenerationSchema } from "@/lib/image-generation/config";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = imageGenerationSchema.parse(json);
    const result = await generateImage(payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload invalide", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Generation impossible",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
