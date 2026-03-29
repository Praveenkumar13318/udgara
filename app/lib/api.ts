export async function fetchPosts({ pageParam = null }: any) {
  const publicId = localStorage.getItem("publicId");

  if (!publicId) return { posts: [], nextCursor: null };

  const url = pageParam
    ? `/api/posts?cursor=${pageParam}&publicId=${publicId}`
    : `/api/posts?publicId=${publicId}`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    posts: data.posts || [],
    nextCursor: data.nextCursor || null,
  };
}