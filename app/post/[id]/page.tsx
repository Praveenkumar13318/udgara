import PostClient from "./PostClient";
import { connectDB } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: any) {
  try {
    const db: any = await connectDB();

    // ✅ USE ID EXACTLY AS IS
    const post = await db.collection("posts").findOne({
      postId: params.id,
    });

    if (!post) {
      return {
        title: "Udgara",
        description: "View post on Udgara",
      };
    }

    const title = `${post.publicId?.toUpperCase()} on Udgara`;
    const description =
      post.content?.slice(0, 120) || "View post on Udgara";

    const image =
      post.image ||
      "https://udgara.vercel.app/icon-152.png";

    return {
      title,
      description,

      openGraph: {
        title,
        description,
        url: `https://udgara.vercel.app/post/${post.postId}`,
        type: "article",

        images: [
          {
            url: image,
            width: 1200,
            height: 630,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch (e) {
    return {
      title: "Udgara",
      description: "View post on Udgara",
    };
  }
}

export default function Page(props: any) {
  return <PostClient {...props} />;
}