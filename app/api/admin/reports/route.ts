import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";

export async function GET() {

  try {

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