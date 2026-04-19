import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import { getUserFromRequest } from "../../lib/auth";
import { createPost, deletePost } from "../../services/postService";
import { stripId, stripIds, ok, err, validateContent, sanitizeText } from "../../lib/apiHelpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor");
    const user = getUserFromRequest(req);
    const publicId = user?.publicId ?? null;

    const db = await connectDB();

    if (postId) {
      const post = await db.collection("posts").findOne({ postId });
      if (!post) return err("Post not found", 404);

      const likes = await db.collection("likes").find({ postId }).toArray();
      const likerSet = new Set(likes.map((l: any) => l.npId));

      return ok({
        post: {
          ...stripId(post),
          likes: likerSet.size,
          isLiked: publicId ? likerSet.has(publicId.toUpperCase()) : false,
        },
      });
    }

    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 20);
    const query: any = cursor ? { createdAtMs: { $lt: Number(cursor) } } : {};

    const posts = await db
      .collection("posts")
      .find(query)
      .sort({ createdAtMs: -1, _id: -1 })
      .limit(limit)
      .toArray();

    const postIds = posts.map((p: any) => p.postId);
    const likes = await db
      .collection("likes")
      .find({ postId: { $in: postIds } })
      .toArray();

    const likeMap = new Map<string, Set<string>>();
    for (const l of likes) {
      if (!likeMap.has(l.postId)) likeMap.set(l.postId, new Set());
      likeMap.get(l.postId)!.add(l.npId);
    }

    const enriched = stripIds(posts).map((post: any) => {
      const likers = likeMap.get(post.postId) ?? new Set();
      return {
        ...post,
        likes: likers.size,
        isLiked: publicId ? likers.has(publicId.toUpperCase()) : false,
      };
    });

    return ok({
      posts: enriched,
      nextCursor: enriched.length > 0 ? enriched[enriched.length - 1].createdAtMs : null,
    });

  } catch (e) {
    console.error("[GET /api/posts]", e);
    return err("Failed to load posts", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.publicId) return err("Unauthorized", 401);

    const body = await req.json();
    const contentError = validateContent(body.content);
    if (contentError) return err(contentError, 400);

    const image = typeof body.image === "string" ? body.image : undefined;

    const post = await createPost({
      content: sanitizeText(body.content),
      image,
      publicId: user.publicId,
    });

    return ok({ success: true, post: stripId(post) }, 201);
  } catch (e) {
    console.error("[POST /api/posts]", e);
    return err("Failed to create post", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.publicId) return err("Unauthorized", 401);

    const body = await req.json();
    if (!body.postId) return err("Missing postId", 400);

    try {
      await deletePost({ postId: body.postId, publicId: user.publicId });
    } catch (e: any) {
      const status = e.message === "Post not found" ? 404 : 403;
      return err(e.message, status);
    }

    return ok({ success: true });
  } catch (e) {
    console.error("[DELETE /api/posts]", e);
    return err("Failed to delete post", 500);
  }
}