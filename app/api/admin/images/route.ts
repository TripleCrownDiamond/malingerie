import { NextResponse } from "next/server";

import { uploadImageToCloudinary } from "@/lib/server/cloudinary";
import { getRequiredAdminUserId } from "@/lib/server/admin-auth";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await getRequiredAdminUserId();
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const publicId = String(formData.get("publicId") ?? "admin-product");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Image manquante" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Le fichier doit etre une image" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ ok: false, error: "Image trop lourde: 8 Mo maximum" }, { status: 400 });
    }

    const result = await uploadImageToCloudinary({ file, publicId });

    return NextResponse.json({ ok: true, image: result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload Cloudinary impossible" },
      { status: 500 },
    );
  }
}
