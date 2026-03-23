import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

/* =========================
   POST RATE LIMIT (1 MIN)
========================= */

const postRateLimit = new Map<string, number>();

/* =========================
   CREATE POST
========================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const content = body.content;
    const image = body.image;
    const publicId = body.publicId;

    if (!publicId) {
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

    const now = Date.now();
    const lastPostTime = postRateLimit.get(publicId);

    if (lastPostTime && now - lastPostTime < 60000) {
      const remaining = Math.ceil((60000 - (now - lastPostTime)) / 1000);

      return NextResponse.json(
        { error: `Please wait ${remaining}s before posting again.` },
        { status: 429 }
      );
    }

    const db: any = await connectDB();

    const postId = "post_" + Math.random().toString(36).substring(2, 10);

    let imageUrl: string | null = null;

    if (image && typeof image === "string" && image.trim() !== "") {
      imageUrl = image;
    }

    const post = {
      postId,
      npId: publicId.toUpperCase(),
      content: content.trim(),
      image: imageUrl,
      likes: 0,
      commentsCount: 0,
      views: 0,
      reports: 0,
      createdAt: new Date(),
      createdAtMs: now
    };

    await db.collection("posts").insertOne(post);

    postRateLimit.set(publicId, now);

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create post" },
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
    const publicId = searchParams.get("publicId"); // ✅ ADDED

    const db: any = await connectDB();

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

    /* 🔥 ADD THIS BLOCK ONLY */

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

    const enrichedPosts = posts.map((post: any) => {
      const users = likeMap.get(post.postId) || new Set();

      return {
        ...post,
        isLiked: publicId ? users.has(publicId.toUpperCase()) : false // ✅ KEY FIX
      };
    });

    const nextCursor =
      enrichedPosts.length > 0
        ? enrichedPosts[enrichedPosts.length - 1].createdAtMs
        : null;

    return NextResponse.json({
      posts: enrichedPosts, // ✅ UPDATED
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