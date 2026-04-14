import { connectDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/auth";
import { toggleLike } from "../../services/likeService";
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const postId = String(body.postId || "").trim();
    const user = getUserFromRequest(req);

// 🔐 prefer secure token
const publicId =
  user?.publicId ||
  String(body.publicId || "").trim();

    /* =========================
       VALIDATION (PRO LEVEL)
    ========================= */

    if (!postId || !publicId) {
      return NextResponse.json(
        { error: "Missing postId or publicId" },
        { status: 400 }
      );
    }

    const { liked, likeCount } = await toggleLike({
  postId,
  publicId
});

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json({
      success: true,
      action: liked ? "liked" : "unliked",
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