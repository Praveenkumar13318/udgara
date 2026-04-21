import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user?.publicId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await connectDB();
  const dbUser = await db.collection("users").findOne({ npId: user.publicId });
  if (dbUser?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const grouped = await db.collection("reports").aggregate([
    { $match: { resolved: { $ne: true } } },
    { $group: {
      _id: "$postId",
      reportCount: { $sum: 1 },
      reasons: { $push: "$reason" },
    }},
    { $sort: { reportCount: -1 } },
    { $limit: 50 },
  ]).toArray();

  const postIds = grouped.map((r: any) => r._id);
  const posts = await db.collection("posts").find({ postId: { $in: postIds } }).toArray();
  const postMap = new Map(posts.map((p: any) => [p.postId, p]));

  const result = grouped.map((r: any) => ({
    postId: r._id,
    reportCount: r.reportCount,
    reasons: r.reasons,
    post: postMap.get(r._id) ?? null,
  }));

  return NextResponse.json(result);
}