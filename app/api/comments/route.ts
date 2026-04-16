import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import { pusher } from "@/app/lib/pusher";

function generateCommentId() {
  return "CM" + Date.now();
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

    // 🔥 GET UPDATED POST (IMPORTANT)
const updatedPost = await db.collection("posts").findOne({ postId });

await pusher.trigger("posts", "comment-update", {
  postId,
  commentsCount: updatedPost?.commentsCount || 0
});

return NextResponse.json({
  success: true,
  comment,
  commentsCount: updatedPost?.commentsCount || 0
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