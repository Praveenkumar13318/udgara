import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    const db: any = await connectDB();

    const record = await db.collection("otpCodes").findOne({ email });

    if (!record) {
      return NextResponse.json({ error: "OTP not found" }, { status: 400 });
    }

    const otpValid = await bcrypt.compare(otp, record.otp);
if (!otpValid) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // delete used OTP
    await db.collection("otpCodes").deleteMany({ email });

    let user = await db.collection("users").findOne({ email });

    // create new user if not exists
    if (!user) {
       const { randomUUID } = await import("crypto");
       const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let npId = "NP";
for (let i = 0; i < 8; i++) npId += chars[Math.floor(Math.random() * chars.length)];
 // Collision check (astronomically rare but safe)
while (await db.collection("users").findOne({ npId })) {
npId = "NP" + Array.from({length:8}, () => chars[Math.floor(Math.random()*chars.length)]).join("");}

      const newUser = {
        email,
        npId,
        createdAt: new Date()
      };

      const result = await db.collection("users").insertOne(newUser);

      user = {
        _id: result.insertedId,
        ...newUser
      };
    }

    // 🔥 GENERATE TOKEN (CRITICAL FIX)
    const token = jwt.sign(
{ userId: user._id.toString(), publicId: user.npId },
process.env.JWT_SECRET as string,
{ expiresIn: "7d" }
);

    return NextResponse.json({
      success: true,
      token,                 // ✅ ADD THIS
      publicId: user.npId
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}