import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    /* ---------- NUDITY CHECK ---------- */

    const sightForm = new FormData();
    sightForm.append("media", new Blob([buffer]));
    sightForm.append("models", "nudity-2.1");
    sightForm.append("api_user", process.env.SIGHTENGINE_USER!);
    sightForm.append("api_secret", process.env.SIGHTENGINE_SECRET!);

    const moderation = await fetch(
      "https://api.sightengine.com/1.0/check.json",
      {
        method: "POST",
        body: sightForm
      }
    );

    const result = await moderation.json();

    const nudityScore =
      result.nudity.sexual_activity +
      result.nudity.sexual_display +
      result.nudity.erotica;

    if (nudityScore > 0.6) {

      return NextResponse.json(
        { error: "Explicit content detected. Upload blocked." },
        { status: 400 }
      );

    }

    /* ---------- CLOUDINARY UPLOAD ---------- */

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    const cloudForm = new FormData();
    cloudForm.append("file", file);
    cloudForm.append("upload_preset", uploadPreset!);

    const cloudinary = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudForm
      }
    );

    const cloudData = await cloudinary.json();

    console.log("Cloudinary response:", cloudData);

    if (!cloudData.secure_url) {
      return NextResponse.json(
        { error: "Cloudinary upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: cloudData.secure_url
    });

  } catch (error) {

    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );

  }

}