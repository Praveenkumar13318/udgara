import { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://udgara.vercel.app";

    const res = await fetch(`${base}/api/posts?postId=${params.id}`, {
      cache: "no-store",
    });

    const data = await res.json();
    const post = data?.post;

    if (!post) {
      return {
        title: "Udgara",
        description: "Share your thoughts. Stay anonymous.",
      };
    }

    const npId = (post.npId ?? "Anonymous").toUpperCase();
    const content = post.content ?? "";
    const description = content.length > 120
      ? content.slice(0, 120) + "..."
      : content;

    const ogImageUrl = `${base}api/og/post?postId=${params.id}`;

    return {
      title: `${npId} on Udgara`,
      description,
      openGraph: {
        title: `${npId} on Udgara`,
        description,
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${npId}'s post on Udgara`,
        }],
        type: "article",
        siteName: "Udgara",
      },
      twitter: {
        card: "summary_large_image",
        title: `${npId} on Udgara`,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return { title: "Udgara" };
  }
}

export { default } from "./PostClient";