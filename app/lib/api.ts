export async function fetchPosts({ pageParam = null }: any) {
  try {
    let url = "/api/posts";

    // pagination
    if (pageParam) {
      url += `?cursor=${pageParam}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // always fresh feed
    });

    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await res.json();

    return {
      posts: Array.isArray(data.posts) ? data.posts : [],
      nextCursor: data.nextCursor || null,
    };

  } catch (error) {
    console.error("FETCH POSTS ERROR:", error);

    return {
      posts: [],
      nextCursor: null,
    };
  }
}