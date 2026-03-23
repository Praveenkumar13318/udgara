import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";

export async function POST(request:Request){

  try{

    const data = await request.json();
    const { postId, reason } = data;

    const db:any = await connectDB();

    await db.collection("reports").insertOne({
      postId,
      reason,
      createdAt:new Date()
    });

    await db.collection("posts").updateOne(
      { postId },
      { $inc:{ reports:1 } }
    );

    return NextResponse.json({
      success:true
    });

  }catch(error){

    console.error(error);

    return NextResponse.json({
      error:"Server error"
    });

  }

}