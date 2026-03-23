import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function POST(req: Request) {

  try {

    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();

    await db.collection("posts").updateOne(
      { postId },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ success: true });

  } catch (error) {

    console.log("View error:", error);

    return NextResponse.json(
      { error: "Failed to update view" },
      { status: 500 }
    );

  }

}