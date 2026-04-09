import { connectDB } from "../lib/mongodb";

/* =========================
   CREATE POST
========================= */
export async function createPost({ content, image, publicId }: any) {
  const db = await connectDB();

  const postId =
    "post_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 6);

  const post = {
    postId,
    npId: publicId,
    content: content.trim(),
    image: image || null,
    likes: 0,
    commentsCount: 0,
    views: 0,
    reports: 0,
    createdAt: new Date(),
    createdAtMs: Date.now()
  };

  await db.collection("posts").insertOne(post);

  return post;
}

/* =========================
   DELETE POST
========================= */
export async function deletePost({ postId, publicId }: any) {
  const db = await connectDB();

  const post = await db.collection("posts").findOne({ postId });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.npId !== publicId) {
    throw new Error("Not allowed");
  }

  await db.collection("posts").deleteOne({ postId });

  return true;
}