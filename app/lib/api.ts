export async function fetchPosts({ pageParam = null }: any) {
  try {
    // 🔐 GET TOKEN (SAFE CLIENT CHECK)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    // ✅ BUILD URL (CLEAN — NO publicId)
    let url = "/api/posts";

    if (pageParam) {
      url += `?cursor=${pageParam}`;
    }

    // ✅ FETCH WITH AUTH HEADER
    const res = await fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      console.log("FETCH ERROR:", res.status);
      return { posts: [], nextCursor: null };
    }

    let data;
    try {
      data = await res.json();
    } catch {
      console.log("Invalid JSON response");
      return { posts: [], nextCursor: null };
    }

    return {
      posts: Array.isArray(data.posts) ? data.posts : [],
      nextCursor: data.nextCursor || null,
    };

  } catch (error) {
    console.log("FETCH POSTS ERROR:", error);

    return {
      posts: [],
      nextCursor: null,
    };
  }
}