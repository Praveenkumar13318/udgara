import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "User password not set properly" },
        { status: 500 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        publicId: user.publicId,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      token,
      publicId: user.publicId,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}