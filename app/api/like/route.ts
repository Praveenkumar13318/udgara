import { connectDB } from "../../lib/mongodb";
import { getUserFromRequest } from "../../lib/auth";
import { pusher } from "@/app/lib/pusher";
import { err, ok } from "@/app/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.publicId) return err("Unauthorized", 401);

    const body = await req.json();
    const postId = typeof body.postId === "string" ? body.postId.trim() : "";
    if (!postId) return err("Missing postId", 400);

    const publicId = user.publicId.toUpperCase();
    const db = await connectDB();

    const existing = await db.collection("likes").findOne({ postId, npId: publicId });

    let liked: boolean;
    if (existing) {
      await db.collection("likes").deleteOne({ postId, npId: publicId });
      liked = false;
    } else {
      await db.collection("likes").insertOne({
        postId,
        npId: publicId,
        createdAt: new Date(),
      });
      liked = true;
    }

    const likeCount = await db.collection("likes").countDocuments({ postId });

    await pusher.trigger("posts", "like-update", {
      postId,
      likeCount,
      action: liked ? "liked" : "unliked",
    });

    return ok({ success: true, action: liked ? "liked" : "unliked", likeCount });

  } catch (e) {
    console.error("[POST /api/like]", e);
    return err("Failed to process like", 500);
  }
}