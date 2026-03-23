import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function POST(request: Request) {
  try {
    const { postId, publicId } = await request.json();

    if (!postId || !publicId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const npId = publicId.toUpperCase();

    const db: any = await connectDB();

    const existing = await db.collection("likes").findOne({
      postId,
      npId
    });

    let action = "liked";

    if (existing) {

      // 🔥 UNLIKE
      await db.collection("likes").deleteOne({
        postId,
        npId
      });

      action = "unliked";

    } else {

      // 🔥 SAFE LIKE (NO DUPLICATE)
      await db.collection("likes").updateOne(
        { postId, npId },
        {
          $setOnInsert: {
            postId,
            npId,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      action = "liked";
    }

    // 🔥 TRUE COUNT FROM DB
    const likeCount = await db
      .collection("likes")
      .countDocuments({ postId });

    // 🔥 SYNC POSTS COLLECTION
    await db.collection("posts").updateOne(
      { postId },
      { $set: { likes: likeCount } }
    );

    return NextResponse.json({
      success: true,
      action,          // ✅ keeps your frontend working
      likeCount        // (extra, future use)
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}