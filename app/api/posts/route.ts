import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

/* =========================
   POST RATE LIMIT (1 MIN)
========================= */

const postRateLimit = new Map<string, number>();

/* =========================
   CREATE POST
========================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor");
    const publicId = searchParams.get("publicId"); // optional (OK)

    const db: any = await connectDB();

    /* =========================
       SINGLE POST
    ========================= */

    if (postId) {
      const post = await db
        .collection("posts")
        .findOne({ postId });

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ post });
    }

    /* =========================
       FEED (PUBLIC)
    ========================= */

    const limit = 10;

    let query: any = {};

    if (cursor) {
      query.createdAtMs = { $lt: Number(cursor) };
    }

    const posts = await db
      .collection("posts")
      .find(query)
      .sort({
        createdAtMs: -1,
        _id: -1
      })
      .limit(limit)
      .toArray();

    /* =========================
       LIKES (OPTIONAL)
    ========================= */

    const postIds = posts.map((p: any) => p.postId);

    const likes = await db.collection("likes").find({
      postId: { $in: postIds }
    }).toArray();

    const likeMap = new Map<string, Set<string>>();

    likes.forEach((l: any) => {
      if (!likeMap.has(l.postId)) {
        likeMap.set(l.postId, new Set());
      }
      likeMap.get(l.postId)?.add(l.npId);
    });

    /* =========================
       ENRICH POSTS
    ========================= */

    const enrichedPosts = posts.map((post: any) => {
      const users = likeMap.get(post.postId) || new Set();

      return {
        ...post,
        // 🔥 IMPORTANT: SAFE CHECK
        isLiked:
          publicId && typeof publicId === "string"
            ? users.has(publicId.toUpperCase())
            : false
      };
    });

    /* =========================
       PAGINATION
    ========================= */

    const nextCursor =
      enrichedPosts.length > 0
        ? enrichedPosts[enrichedPosts.length - 1].createdAtMs
        : null;

    return NextResponse.json({
      posts: enrichedPosts,
      nextCursor
    });

  } catch (error) {
    console.error("LOAD POSTS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    const { postId, publicId } = await req.json();

    if (!postId || !publicId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();

    const post = await db.collection("posts").findOne({ postId });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 🔒 ONLY OWNER CAN DELETE
    if (post.npId !== publicId.toUpperCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await db.collection("posts").deleteOne({ postId });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
