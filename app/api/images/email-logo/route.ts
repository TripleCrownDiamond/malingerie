import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const logoPath = path.join(process.cwd(), "public", "logo-nav-femme.png");
  const logo = await fs.readFile(logoPath);

  return new Response(logo, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
