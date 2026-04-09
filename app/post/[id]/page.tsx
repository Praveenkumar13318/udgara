import PostClient from "./PostClient";
import { connectDB } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: any) {
  try {
    // ✅ FIX: use full correct URL
    const res = await fetch(
      `https://udgara.vercel.app/api/posts?postId=${params.id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        title: "Udgara",
        description: "View post on Udgara",
      };
    }

    const data = await res.json();
    const post = data?.post;

    if (!post) {
      return {
        title: "Udgara",
        description: "View post on Udgara",
      };
    }

    const title = `${post.publicId} on Udgara`;
    const description =
      post.content?.slice(0, 120) || "View post on Udgara";

    const image =
      post.image || "https://udgara.vercel.app/icon-152.png";

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