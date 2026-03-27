import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";

export async function POST(request: Request){

  try{

    const { postId, publicId } = await request.json();

    // 🔐 ADMIN CHECK
    if(publicId !== "NP000001"){
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const db:any = await connectDB();

    await db.collection("posts").deleteOne({
      postId: postId
    });

    await db.collection("comments").deleteMany({
      postId: postId
    });

    await db.collection("likes").deleteMany({
      postId: postId
    });

    await db.collection("reports").deleteMany({
      postId: postId
    });

    return NextResponse.json({success:true});

  }catch(error){

    console.error(error);

    return NextResponse.json(
      {error:"Server error"},
      {status:500}
    );

  }

}