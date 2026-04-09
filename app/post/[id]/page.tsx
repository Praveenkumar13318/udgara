import PostClient from "./PostClient";
import { connectDB } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: any) {
  try {
    const db: any = await connectDB();

    const post = await db.collection("posts").findOne({
      postId: params.id,
    });

    if (!post) {
      return {
        title: "Udgara",
        description: "View post on Udgara",
      };
    }

    return {
      title: post.ogTitle || `${post.npId} on Udgara`,
      description:
        post.ogDescription ||
        post.content?.slice(0, 120) ||
        "View post on Udgara",

      openGraph: {
        title: post.ogTitle || `${post.npId} on Udgara`,
        description:
          post.ogDescription || post.content?.slice(0, 120),
        url: `https://udgara.vercel.app/post/${post.postId}`,
        type: "article",
        images: [
          {
            url:
              post.ogImage ||
              post.image ||
              "https://udgara.vercel.app/icon-152.png",
            width: 1200,
            height: 630,
          },
        ],
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