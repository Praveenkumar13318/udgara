import { connectDB } from "./mongodb";

export async function getPostById(postId: string) {
  try {
    const db: any = await connectDB();

    const post = await db.collection("posts").findOne({
      postId: postId,
    });

    return post;
  } catch (error) {
    console.error("DB FETCH ERROR:", error);
    return null;
  }
}