import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function POST(request:Request){

  try{

    const data = await request.json();
    const { postId, reason, npId } = data;

    // 🔐 BASIC VALIDATION
    if (!postId || !reason || !npId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const db:any = await connectDB();

    // 🔥 PREVENT DUPLICATE REPORT (OPTIONAL BUT IMPORTANT)
    const existing = await db.collection("reports").findOne({
  postId,
  npId
});

    if (existing) {
      return NextResponse.json({
        success:true,
        message:"Already reported"
      });
    }

    await db.collection("reports").insertOne({
  postId,
  npId,
  reason,
  createdAt: new Date()
});
    await db.collection("posts").updateOne(
      { postId },
      { $inc:{ reports:1 } }
    );

    return NextResponse.json({
      success:true
    });

  }catch(error){

    console.error("REPORT ERROR:", error);

    return NextResponse.json(
      { error:"Server error" },
      { status:500 }
    );

  }

}