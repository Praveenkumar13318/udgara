import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { err, ok } from "@/app/lib/apiHelpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!EMAIL_REGEX.test(email) || !password) {
      return err("Invalid credentials", 401);
    }

    const db = await connectDB();
    const user = await db.collection("users").findOne({ email });

    const WRONG = "Invalid email or password";

    if (!user || !user.passwordHash) {
      await bcrypt.hash("dummy", 12);
      return err(WRONG, 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return err(WRONG, 401);

    const token = jwt.sign(
      { userId: user._id.toString(), publicId: user.publicId },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return ok({ success: true, token, publicId: user.publicId });

  } catch (e) {
    console.error("[POST /api/auth/login]", e);
    return err("Login failed", 500);
  }
}