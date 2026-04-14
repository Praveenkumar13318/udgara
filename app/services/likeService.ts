import { connectDB } from "@/app/lib/mongodb";

type ToggleLikeInput = {
  postId: string;
  publicId: string;
};

type ToggleLikeResponse = {
  liked: boolean;
  likeCount: number;
};

export async function toggleLike({
  postId,
  publicId
}: ToggleLikeInput): Promise<ToggleLikeResponse> {
  if (!postId || !publicId) {
    throw new Error("Invalid like data");
  }

  const db: any = await connectDB();

  const npId = publicId.toUpperCase();

  let liked = false;

  try {
    // ✅ TRY TO INSERT (LIKE)
    await db.collection("likes").insertOne({
      postId,
      npId,
      createdAt: new Date()
    });

    liked = true;

  } catch (err: any) {
    // ✅ IF DUPLICATE → UNLIKE
    if (err.code === 11000) {
      await db.collection("likes").deleteOne({
        postId,
        npId
      });

      liked = false;

    } else {
      throw err;
    }
  }

  // ✅ ALWAYS RETURN REAL COUNT (source of truth)
  const likeCount = await db.collection("likes").countDocuments({
    postId
  });

  return {
    liked,
    likeCount
  };
}