import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user?.publicId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await connectDB();
  const dbUser = await db.collection("users").findOne({ npId: user.publicId });
  if (dbUser?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { postId } = await req.json();
  await db.collection("reports").updateMany({ postId }, { $set: { resolved: true } });
  await db.collection("posts").updateOne({ postId }, { $set: { reports: 0 } });

  return NextResponse.json({ success: true });
}