import PostClient from "./PostClient";

export async function generateMetadata({ params }: any) {
  const postId = params.id;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts?postId=${postId}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const post = data?.post || data?.posts?.[0];

    if (!post) {
      return { title: "Post not found" };
    }

    return {
      title: `${post.npId} on Udgara`,
      description: post.content || "View post on Udgara",
      openGraph: {
        title: `${post.npId} on Udgara`,
        description: post.content,
        images: post.image ? [post.image] : [],
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${post.postId}`,
      },
    };
  } catch {
    return { title: "Udgara" };
  }
}

export default function Page(props: any) {
  return <PostClient {...props} />;
}