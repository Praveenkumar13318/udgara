import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const db: any = await connectDB();

    const posts = await db
      .collection("posts")
      .find({
        content: { $regex: query, $options: "i" }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(posts);

  } catch (error) {

    console.log("Search error:", error);

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );

  }

}