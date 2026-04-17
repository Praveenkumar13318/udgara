import Home from "./HomeClient";

export async function generateMetadata({ searchParams }: any) {
  const postId = searchParams?.post;

  return {
    title: "Udgara",
    description: "Check this post",
    openGraph: {
      title: "Udgara",
      description: "View this post",
      images: [`/og?postId=${postId}`],
    },
  };
}

export default function Page() {
  return <Home />;
}