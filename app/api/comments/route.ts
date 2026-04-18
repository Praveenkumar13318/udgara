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
    const comments = await db
      .collection("comments")
      .find({ postId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return ok({ success: true, comments: stripIds(comments) });
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
    const textError = validateContent(body.text);

    if (!postId) return err("Missing postId", 400);
    if (textError) return err(textError, 400);

    const db = await connectDB();

    const postExists = await db.collection("posts").findOne({ postId });
    if (!postExists) return err("Post not found", 404);

    const comment = {
      commentId: `CM_${randomUUID()}`,
      postId,
      npId: user.publicId,
      text: sanitizeText(body.text),
      createdAt: new Date(),
    };

    await db.collection("comments").insertOne(comment);

    const updated = await db.collection("posts").findOneAndUpdate(
      { postId },
      { $inc: { commentsCount: 1 } },
      { returnDocument: "after" }
    );

    await pusher.trigger("posts", "comment-update", {
      postId,
      commentsCount: updated?.commentsCount ?? 0,
    });

    const { _id, ...safeComment } = comment as any;
    return ok({ success: true, comment: safeComment, commentsCount: updated?.commentsCount ?? 0 }, 201);

  } catch (e) {
    console.error("[POST /api/comments]", e);
    return err("Failed to post comment", 500);
  }
}