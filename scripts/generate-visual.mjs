#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);

const prompt = args.prompt ?? "Luxury lingerie editorial visual on ivory background";
const model = args.model ?? "gpt-image-2";
const size = args.size ?? "1536x1024";
const quality = args.quality ?? "medium";
const output = args.output ?? `generated-${Date.now()}.png`;

const baseUrl = process.env.IMAGE_API_BASE_URL ?? "https://build.lewisnote.com";
const apiKey = process.env.IMAGE_API_KEY;

if (!apiKey) {
  console.error("IMAGE_API_KEY manquante. Definis-la dans ton environnement.");
  process.exit(1);
}

const endpoint = model === "flux" ? `${baseUrl}/v1/images/flux` : `${baseUrl}/v1/images`;
const body =
  model === "flux"
    ? {
        prompt,
        width: Number(args.width ?? 1024),
        height: Number(args.height ?? 1024),
        steps: Number(args.steps ?? 25),
      }
    : {
        model,
        prompt,
        size,
        quality,
      };

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (!response.ok) {
  console.error(`Generation echouee: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const payload = await response.json();
const first = Array.isArray(payload.data) ? payload.data[0] : payload;
const imageUrl = first?.url;
const b64 = first?.b64_json;

await fs.mkdir(path.resolve("public", "generated"), { recursive: true });
const outPath = path.resolve("public", "generated", output);

if (imageUrl && typeof imageUrl === "string") {
  const imgResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imgResponse.arrayBuffer());
  await fs.writeFile(outPath, buffer);
  console.log(`Image enregistree: ${outPath}`);
  process.exit(0);
}

if (b64 && typeof b64 === "string") {
  await fs.writeFile(outPath, Buffer.from(b64, "base64"));
  console.log(`Image enregistree: ${outPath}`);
  process.exit(0);
}

console.error("Reponse sans image exploitable.");
console.error(JSON.stringify(payload, null, 2));
process.exit(1);
