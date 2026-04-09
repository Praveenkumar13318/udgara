import PostClient from "./PostClient";

export async function generateMetadata({ params }: any) {
  const postId = params.id;

  try {
    const res = await fetch(
      `https://udgara.vercel.app/api/posts?postId=${postId}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const post = data?.post || data?.posts?.[0];

    if (!post) {
      return {
        title: "Post not found",
      };
    }

    return {
      title: `${post.npId} on Udgara`,
      description: post.content?.slice(0, 120) || "View post on Udgara",

      openGraph: {
        title: `${post.npId} on Udgara`,
        description: post.content?.slice(0, 120),
        url: `https://udgara.vercel.app/post/${post.postId}`,
        images: post.image
          ? [
              {
                url: post.image,
                width: 800,
                height: 600,
              },
            ]
          : [],
      },

      twitter: {
        card: "summary_large_image",
        title: `${post.npId} on Udgara`,
        description: post.content?.slice(0, 120),
        images: post.image ? [post.image] : [],
      },
    };
  } catch (err) {
    return {
      title: "Udgara",
    };
  }
}

export default function Page(props: any) {
  return <PostClient {...props} />;
}