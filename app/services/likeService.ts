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

  // 🔒 CHECK EXISTING LIKE
  const existing = await db.collection("likes").findOne({
    postId,
    npId
  });

  let liked = false;

  if (existing) {
    // 🔻 UNLIKE
    await db.collection("likes").deleteOne({
      postId,
      npId
    });
    liked = false;
  } else {
    // 🔺 LIKE
    try {
      await db.collection("likes").insertOne({
        postId,
        npId,
        createdAt: new Date()
      });
      liked = true;
    } catch (err: any) {
      // 🔒 HANDLE RACE CONDITION (DOUBLE CLICK)
      if (err.code === 11000) {
        liked = true;
      } else {
        throw err;
      }
    }
  }

  // 📊 FINAL COUNT (SOURCE OF TRUTH)
  const likeCount = await db.collection("likes").countDocuments({
    postId
  });

  return {
    liked,
    likeCount
  };
}