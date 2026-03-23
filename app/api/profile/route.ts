import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const npId = searchParams.get("npId");

    if (!npId) {
      return NextResponse.json(
        { success: false, message: "npId required" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();
    const upperId = npId.toUpperCase();

    /* ================= POSTS ================= */

    const posts = await db
      .collection("posts")
      .find({ npId: upperId })
      .project({
        _id: 1,
        postId: 1,
        npId: 1,
        content: 1,
        image: 1,
        likes: 1,
        commentsCount: 1,
        createdAt: 1,
        createdAtMs: 1
      })
      .sort({ createdAtMs: -1 })
      .limit(50) // 🔥 LIMIT ADDED
      .toArray();

    /* ================= COMMENTS ================= */

    const comments = await db
      .collection("comments")
      .find({ npId: upperId })
      .project({
        _id: 1,
        postId: 1,
        npId: 1,
        text: 1,
        createdAt: 1
      })
      .sort({ createdAt: -1 })
      .limit(50) // 🔥 LIMIT ADDED
      .toArray();

    /* ================= STATS ================= */

    const totalLikes = posts.reduce(
      (acc: number, p: any) => acc + (p.likes || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        posts,
        comments,
        stats: {
          posts: posts.length,
          comments: comments.length,
          likes: totalLikes
        }
      }
    });

  } catch (error) {

    console.error("PROFILE API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );

  }

}