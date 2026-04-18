import { getUserFromRequest } from "../../lib/auth";
import { err, ok } from "../../lib/apiHelpers";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.publicId) return err("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return err("No file uploaded", 400);
    if (!ALLOWED_TYPES.includes(file.type)) {
      return err("Only JPEG, PNG, WebP, and GIF images are allowed", 400);
    }
    if (file.size > MAX_SIZE_BYTES) {
      return err("File too large. Maximum size is 10MB", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sightForm = new FormData();
    sightForm.append("media", new Blob([buffer], { type: file.type }));
    sightForm.append("models", "nudity-2.1");
    sightForm.append("api_user", process.env.SIGHTENGINE_USER!);
    sightForm.append("api_secret", process.env.SIGHTENGINE_SECRET!);

    const modRes = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: sightForm,
    });

    const modData = await modRes.json();

    const nudityScore =
      (modData?.nudity?.sexual_activity ?? 0) +
      (modData?.nudity?.sexual_display ?? 0) +
      (modData?.nudity?.erotica ?? 0);

    if (nudityScore > 0.6) {
      return err("Explicit content detected. Upload blocked.", 400);
    }

    const cloudForm = new FormData();
    cloudForm.append("file", file);
    cloudForm.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!);
    cloudForm.append("transformation", JSON.stringify([
      { width: 1200, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ]));

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudForm }
    );

    const cloudData = await cloudRes.json();
    if (!cloudData.secure_url) {
      console.error("[UPLOAD] Cloudinary failed:", cloudData.error?.message);
      return err("Image upload failed", 500);
    }

    return ok({ success: true, imageUrl: cloudData.secure_url });

  } catch (e) {
    console.error("[POST /api/upload]", e);
    return err("Upload failed", 500);
  }
}