import { connectDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const postId = String(body.postId || "").trim();
    const publicId = String(body.publicId || "").trim();

    /* =========================
       VALIDATION (PRO LEVEL)
    ========================= */

    if (!postId || !publicId) {
      return NextResponse.json(
        { error: "Missing postId or publicId" },
        { status: 400 }
      );
    }

    const db: any = await connectDB();

    const npId = publicId.toUpperCase();

    /* =========================
       TOGGLE LIKE (SAFE)
    ========================= */

    let action: "liked" | "unliked";

    const existing = await db.collection("likes").findOne({
      postId,
      npId
    });

    if (existing) {
      await db.collection("likes").deleteOne({
        postId,
        npId
      });

      action = "unliked";
    } else {
      try {
        await db.collection("likes").insertOne({
          postId,
          npId,
          createdAt: new Date()
        });

        action = "liked";

      } catch (err: any) {
        // 🔥 DUPLICATE SAFE (MULTI-CLICK PROTECTION)
        if (err.code === 11000) {
          action = "liked";
        } else {
          throw err;
        }
      }
    }

    /* =========================
       SOURCE OF TRUTH COUNT
    ========================= */

    const likeCount = await db.collection("likes").countDocuments({
      postId
    });

    /* =========================
       RESPONSE
    ========================= */

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