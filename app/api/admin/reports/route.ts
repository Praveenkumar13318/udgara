import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {

  try {

    // 🔐 GET TOKEN FROM HEADER
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // 🔐 ADMIN CHECK
    if (decoded.publicId !== "NP000001") {
      return NextResponse.json(
        { error: "Forbidden" },
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