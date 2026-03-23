import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";

export async function POST(request: Request) {

  try {

    const { email, otp } = await request.json();

    const db: any = await connectDB();

    const record = await db.collection("otpCodes").findOne({ email });

    if (!record) {
      return NextResponse.json({ error: "OTP not found" }, { status: 400 });
    }

    if (record.otp !== otp) {
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

      const count = await db.collection("users").countDocuments();

      const npId = "NP" + String(count + 1).padStart(6, "0");

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

    return NextResponse.json({
      success: true,
      publicId: user.npId   // IMPORTANT
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );

  }

}