import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // ✅ FIXED DB CONNECTION
    const db: any = await connectDB();

    // Generate public ID
    const count = await db.collection("users").countDocuments();
    const publicId = `np${String(count + 1).padStart(6, "0")}`;

    await db.collection("users").insertOne({
      email,
      publicId,
      role: "user",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, publicId });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}