import { connectDB } from "../lib/mongodb";
import { randomUUID } from "crypto";

interface CreatePostInput {
  content: string;
  image?: string;
  publicId: string;
}

interface DeletePostInput {
  postId: string;
  publicId: string;
}

export async function createPost({ content, image, publicId }: CreatePostInput) {
  const db = await connectDB();

  const now = Date.now();
  const post = {
    postId: `post_${randomUUID()}`,
    npId: publicId,
    content: content.trim(),
    image: image ?? null,
    likes: 0,
    commentsCount: 0,
    views: 0,
    reports: 0,
    createdAt: new Date(now),
    createdAtMs: now,
  };

  await db.collection("posts").insertOne(post);

  const { _id, ...safePost } = post as any;
  return safePost;
}

export async function deletePost({ postId, publicId }: DeletePostInput) {
  const db = await connectDB();

  const post = await db.collection("posts").findOne({ postId });
  if (!post) throw new Error("Post not found");
  if (post.npId !== publicId) throw new Error("Not allowed");

  await db.collection("posts").deleteOne({ postId });
  return true;
}