import PostClient from "./PostClient";
import { getPostById } from "../../lib/serverPosts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: any) {
  const postId = params.id;

  const post = await getPostById(postId);

  if (!post) {
    return {
      title: "Udgara",
      description: "View post on Udgara",
    };
  }

  return {
    title: `${post.npId} on Udgara`,
    description: post.content?.slice(0, 120) || "View post on Udgara",

    openGraph: {
      title: `${post.npId} on Udgara`,
      description: post.content?.slice(0, 120),
      url: `https://udgara.vercel.app/post/${post.postId}`,
      type: "article",

      images: [
        {
          url: post.image || "https://udgara.vercel.app/icon-152.png",
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${post.npId} on Udgara`,
      description: post.content?.slice(0, 120),
      images: [post.image || "https://udgara.vercel.app/icon-152.png"],
    },
  };
}

export default function Page(props: any) {
  return <PostClient {...props} />;
}