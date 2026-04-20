import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const npId = searchParams.get("npId");

    if (!npId) {
      return NextResponse.json({ success: false, message: "npId required" }, { status: 400 });
    }

    const db = await connectDB();
    const upperId = npId.toUpperCase();

    const posts = await db
      .collection("posts")
      .find({ npId: upperId })
      .project({ _id: 0, postId: 1, npId: 1, content: 1, image: 1, commentsCount: 1, createdAt: 1, createdAtMs: 1 })
      .sort({ createdAtMs: -1 })
      .limit(50)
      .toArray();

    const comments = await db
      .collection("comments")
      .find({ npId: upperId })
      .project({ _id: 0, commentId: 1, postId: 1, npId: 1, text: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Count likes from the likes collection — same source of truth as the feed
    const postIds = posts.map((p: any) => p.postId);
    const likes = await db
      .collection("likes")
      .find({ postId: { $in: postIds } })
      .toArray();

    // Build like count per post
    const likeMap = new Map<string, number>();
    for (const l of likes) {
      likeMap.set(l.postId, (likeMap.get(l.postId) ?? 0) + 1);
    }

    // Enrich posts with real like counts
    const enrichedPosts = posts.map((post: any) => ({
      ...post,
      likes: likeMap.get(post.postId) ?? 0,
    }));

    const totalLikes = [...likeMap.values()].reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      data: {
        posts: enrichedPosts,
        comments,
        stats: {
          posts: posts.length,
          comments: comments.length,
          likes: totalLikes,
        },
      },
    });

  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}