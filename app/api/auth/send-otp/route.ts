import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const db: any = await connectDB();

    await db.collection("otpCodes").deleteMany({ email });

    await db.collection("otpCodes").insertOne({
      email: email,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Udgara Login Code",
      text: `Your OTP code is: ${otp}`
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}