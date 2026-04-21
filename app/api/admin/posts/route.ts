import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user?.publicId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await connectDB();
  const dbUser = await db.collection("users").findOne({ npId: user.publicId });
  if (dbUser?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const posts = await db.collection("posts")
    .find({})
    .sort({ createdAtMs: -1 })
    .limit(100)
    .project({ _id: 0, postId: 1, npId: 1, content: 1, image: 1, likes: 1, commentsCount: 1, reports: 1, createdAt: 1 })
    .toArray();

  return NextResponse.json({ posts });
}