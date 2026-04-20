import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import { getUserFromRequest } from "../../lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const npId = searchParams.get("npId");

    if (!npId) {
      return NextResponse.json({ success: false, message: "npId required" }, { status: 400 });
    }

    const db = await connectDB();
    const upperId = npId.toUpperCase();

    // Get the logged-in viewer's publicId to compute isLiked
    const viewer = getUserFromRequest(req);
    const viewerId = viewer?.publicId?.toUpperCase() ?? null;

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

    // Get all likes for these posts in one query
    const postIds = posts.map((p: any) => p.postId);
    const likes = await db
      .collection("likes")
      .find({ postId: { $in: postIds } })
      .toArray();

    // Build like count and viewer's liked set per post
    const likeCountMap = new Map<string, number>();
    const likedByViewer = new Set<string>();

    for (const l of likes) {
      likeCountMap.set(l.postId, (likeCountMap.get(l.postId) ?? 0) + 1);
      if (viewerId && l.npId === viewerId) {
        likedByViewer.add(l.postId);
      }
    }

    // Enrich posts with real like counts and isLiked
    const enrichedPosts = posts.map((post: any) => ({
      ...post,
      likes: likeCountMap.get(post.postId) ?? 0,
      isLiked: likedByViewer.has(post.postId),
    }));

    const totalLikes = [...likeCountMap.values()].reduce((a, b) => a + b, 0);

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