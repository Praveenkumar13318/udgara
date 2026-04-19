import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const db = await connectDB();

    await db.collection("otpCodes").deleteMany({ email });
    await db.collection("otpCodes").insertOne({
      email,
      otp: otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      from: `"Udgara" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Udgara login code",
      text: `Your login code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it.`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
          <h2 style="color:#1e90ff">Udgara</h2>
          <p>Your login code is:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#fff;background:#111;padding:20px;border-radius:12px;text-align:center">${otp}</div>
          <p style="color:#888;font-size:13px;margin-top:16px">Expires in 5 minutes. Do not share this code.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[send-otp]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}