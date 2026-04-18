import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { err, ok } from "@/app/lib/apiHelpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateNPID(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "NP";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!EMAIL_REGEX.test(email)) return err("Invalid email address", 400);
    if (password.length < 8) return err("Password must be at least 8 characters", 400);

    const db = await connectDB();

    const existing = await db.collection("users").findOne({ email });
    if (existing) return err("An account with this email already exists", 409);

    const passwordHash = await bcrypt.hash(password, 12);

    let publicId = generateNPID();
    let attempts = 0;
    while (await db.collection("users").findOne({ publicId })) {
      publicId = generateNPID();
      if (++attempts > 10) throw new Error("NPID generation failed");
    }

    await db.collection("users").insertOne({
      email,
      passwordHash,
      publicId,
      role: "user",
      createdAt: new Date(),
    });

    return ok({ success: true, publicId }, 201);

  } catch (e) {
    console.error("[POST /api/auth/register]", e);
    return err("Registration failed", 500);
  }
}