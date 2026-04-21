import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import { getUserFromRequest } from "../../lib/auth";

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.publicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, reason } = await request.json();
    const npId = user.publicId.toUpperCase();

    if (!postId || !reason) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const db = await connectDB();

    const existing = await db.collection("reports").findOne({ postId, npId });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already reported" });
    }

    await db.collection("reports").insertOne({
      postId,
      npId,
      reason,
      createdAt: new Date(),
      resolved: false,
    });

    await db.collection("posts").updateOne(
      { postId },
      { $inc: { reports: 1 } }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[POST /api/report]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}