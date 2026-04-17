import { ImageResponse } from "next/og";
import { connectDB } from "@/app/lib/mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return new Response("Missing postId", { status: 400 });
    }

    const db: any = await connectDB();
    const post = await db.collection("posts").findOne({ postId });

    const text = post?.content || "Udgara Post";
    const user = post?.npId || "NP00000";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0b0b0c",
            color: "#fff",
            padding: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 24, color: "#aaa" }}>{user}</div>
          <div style={{ fontSize: 40, marginTop: 20 }}>{text}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    return new Response("Error generating OG image", { status: 500 });
  }
}