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

   const { email } = await request.json();
   if (!email || !EMAIL_REGEX.test(email)) {
return NextResponse.json({ error: "Invalid email" }, { status: 400 });
   }

  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpHash = await bcrypt.hash(otp, 10);

    const db: any = await connectDB();

    await db.collection("otpCodes").deleteMany({ email });

    await db.collection("otpCodes").insertOne({
      email: email,
      otp: otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
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