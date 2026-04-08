import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let query = searchParams.get("q") || "";

    // 🔒 STEP 1: Basic sanitization (VERY IMPORTANT)
    query = query.trim();

    if (!query) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 🔒 STEP 2: Escape regex special characters (prevent injection)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const db: any = await connectDB();

    // 🔥 STEP 3: Smart hashtag + text match (NO BREAKING CHANGE)
    const posts = await db
      .collection("posts")
      .find({
        content: {
          $regex: escapedQuery,
          $options: "i"
        }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // ✅ STEP 4: Standard response (fix your current bug)
    return NextResponse.json({
      success: true,
      data: posts
    });

  } catch (error) {
    console.log("Search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Search failed"
      },
      { status: 500 }
    );
  }
}