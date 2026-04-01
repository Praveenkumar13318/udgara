import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

/* =========================
   CREATE POST
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { content, image, publicId } = body;

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json(
        { error: "User not logged in" },
        { status: 401 }
      );
    }

    if (!content || content.trim().length < 3) {
      return NextResponse.json(
        { error: "Content too short" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();

    const postId = "post_" + Math.random().toString(36).substring(2, 10);

    const post = {
      postId,
      npId: publicId.toUpperCase(),
      content: content.trim(),
      image: image || null,
      likes: 0,
      commentsCount: 0,
      views: 0,
      reports: 0,
      createdAt: new Date(),
      createdAtMs: Date.now()
    };

    await db.collection("posts").insertOne(post);

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE POST (SECURE)
========================= */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { postId, publicId } = body;

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

    // 🔐 ONLY OWNER CAN DELETE
    if (post.npId !== publicId.toUpperCase()) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    await db.collection("posts").deleteOne({ postId });

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

/* =========================
   LOAD POSTS / SINGLE POST
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor");
    const publicId = searchParams.get("publicId");

    const db: any = await connectDB();

    /* ===== SINGLE POST ===== */
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

    /* ===== FEED ===== */
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

    /* ===== LIKES ===== */
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

    /* ===== ENRICH ===== */
    const enrichedPosts = posts.map((post: any) => {
      const users = likeMap.get(post.postId) || new Set();

      return {
        ...post,
        isLiked:
          publicId && typeof publicId === "string"
            ? users.has(publicId.toUpperCase())
            : false
      };
    });

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