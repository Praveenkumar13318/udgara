import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

function generateCommentId() {
  return "comment_" + Math.random().toString(36).substring(2, 10);
}

/* ================= CREATE COMMENT ================= */

export async function POST(request: Request) {

  try {

    const { postId, npId, text } = await request.json();

    if (!postId || !npId || !text) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();

    const comment = {
      commentId: generateCommentId(),
      postId,
      npId,
      text,
      createdAt: new Date()
    };

    await db.collection("comments").insertOne(comment);

    await db.collection("posts").updateOne(
      { postId },
      { $inc: { commentsCount: 1 } }
    );

    return NextResponse.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );

  }

}

/* ================= GET COMMENTS ================= */

export async function GET(request: Request) {

  try {

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    const db: any = await connectDB();

    const comments = await db
      .collection("comments")
      .find(postId ? { postId } : {})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: comments
    });

  } catch (error) {

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );

  }

}