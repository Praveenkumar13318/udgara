import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";

export async function GET(req: Request) {

  try {

    // 🔥 GET ADMIN ID FROM QUERY
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    // 🔐 ADMIN CHECK
    if (publicId !== "NP000001") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const db: any = await connectDB();

    const reports = await db.collection("reports").aggregate([
      {
        $group: {
          _id: "$postId",
          count: { $sum: 1 },
          reasons: { $push: "$reason" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    return NextResponse.json(reports);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );

  }

}