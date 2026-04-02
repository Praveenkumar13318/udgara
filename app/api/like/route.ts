import { connectDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const postId = body.postId;
    const publicId = body.publicId;

    // 🔒 VALIDATION
    if (!postId || !publicId) {
      return NextResponse.json(
        { error: "Missing postId or publicId" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();

    const npId = publicId.toUpperCase();

    // 🔍 CHECK IF ALREADY LIKED
    const existingLike = await db.collection("likes").findOne({
      postId,
      npId
    });

    let action: "liked" | "unliked";

    if (existingLike) {
      // ❌ UNLIKE
      await db.collection("likes").deleteOne({
        postId,
        npId
      });

      action = "unliked";
    } else {
      try {
        // ✅ LIKE
        await db.collection("likes").insertOne({
          postId,
          npId,
          createdAt: new Date()
        });

        action = "liked";

      } catch (error: any) {
        // 🔥 HANDLE DUPLICATE (RACE CONDITION SAFE)
        if (error.code === 11000) {
          action = "liked";
        } else {
          throw error;
        }
      }
    }

    // 📊 ALWAYS GET REAL COUNT (SOURCE OF TRUTH)
    const likeCount = await db.collection("likes").countDocuments({
      postId
    });

    return NextResponse.json({
      success: true,
      action,
      likeCount
    });

  } catch (error) {
    console.error("LIKE API ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}