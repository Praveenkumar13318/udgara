import { connectDB } from "../../lib/mongodb";
import { getUserFromRequest } from "../../lib/auth";
import { pusher } from "@/app/lib/pusher";
import { err, ok, stripIds, validateContent, sanitizeText } from "@/app/lib/apiHelpers";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return err("postId is required", 400);

    const db = await connectDB();
    const allComments = await db
      .collection("comments")
      .find({ postId })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    const safe = stripIds(allComments);

    // Separate top-level and replies
    const topLevel = safe.filter((c: any) => !c.parentId);
    const replies = safe.filter((c: any) => !!c.parentId);

    // Attach replies to their parent
    const replyMap = new Map<string, any[]>();
    for (const r of replies) {
      if (!replyMap.has(r.parentId)) replyMap.set(r.parentId, []);
      replyMap.get(r.parentId)!.push(r);
    }

    const threaded = topLevel.map((c: any) => ({
      ...c,
      replies: replyMap.get(c.commentId) ?? [],
    }));

    return ok({ success: true, comments: threaded });
  } catch (e) {
    console.error("[GET /api/comments]", e);
    return err("Failed to load comments", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.publicId) return err("Unauthorized", 401);

    const body = await req.json();
    const postId = typeof body.postId === "string" ? body.postId.trim() : "";
    const parentId = typeof body.parentId === "string" ? body.parentId.trim() : null;
    const textError = validateContent(body.text);

    if (!postId) return err("Missing postId", 400);
    if (textError) return err(textError, 400);

    const db = await connectDB();

    const postExists = await db.collection("posts").findOne({ postId });
    if (!postExists) return err("Post not found", 404);

    // If reply, verify parent exists
    if (parentId) {
      const parentExists = await db.collection("comments").findOne({ commentId: parentId });
      if (!parentExists) return err("Parent comment not found", 404);
    }

    const comment: any = {
      commentId: `CM_${randomUUID()}`,
      postId,
      npId: user.publicId,
      text: sanitizeText(body.text),
      createdAt: new Date(),
    };

    if (parentId) comment.parentId = parentId;

    await db.collection("comments").insertOne(comment);

    // Only increment count for top-level comments
    let commentsCount = postExists.commentsCount ?? 0;
    if (!parentId) {
      const updated = await db.collection("posts").findOneAndUpdate(
        { postId },
        { $inc: { commentsCount: 1 } },
        { returnDocument: "after" }
      );
      commentsCount = updated?.commentsCount ?? 0;

      await pusher.trigger("posts", "comment-update", {
        postId,
        commentsCount,
      });
    }

    const { _id, ...safeComment } = comment as any;
    return ok({
      success: true,
      comment: { ...safeComment, replies: [] },
      commentsCount,
    }, 201);

  } catch (e) {
    console.error("[POST /api/comments]", e);
    return err("Failed to post comment", 500);
  }
}