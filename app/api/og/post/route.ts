import { connectDB } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const db: any = await connectDB();

    const post =
      await db.collection("posts").findOne({ postId: id }) ||
      await db.collection("posts").findOne({ postId: `post_${id}` });

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      title: `${post.npId} on Udgara`,
      description: post.content?.slice(0, 120) || "View post on Udgara",
      image:
        post.image || "https://udgara.vercel.app/icon-152.png",
    });

  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}