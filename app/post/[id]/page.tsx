import PostClient from "./PostClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: any) {
  // 🔥 Clean ID (removes "post_" if exists)
  const rawId = params.id || "";
  const id = rawId.startsWith("post_")
    ? rawId.replace("post_", "")
    : rawId;

  return {
    title: "Udgara",
    description: "View post on Udgara",

    openGraph: {
      title: "Udgara",
      description: "View post on Udgara",
      url: `https://udgara.vercel.app/post/post_${id}`,

      images: [
        {
          // 🔥 STATIC IMAGE (always works)
          url: "https://udgara.vercel.app/icon-152.png",
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Udgara",
      description: "View post on Udgara",
      images: ["https://udgara.vercel.app/icon-152.png"],
    },
  };
}

export default function Page(props: any) {
  return <PostClient {...props} />;
}