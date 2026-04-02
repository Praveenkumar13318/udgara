export async function fetchPosts({ pageParam = null }: any) {
  try {
    let publicId: string | null = null;

    // ✅ SAFE CLIENT CHECK
    if (typeof window !== "undefined") {
      publicId = localStorage.getItem("publicId");
    }

    // ✅ BUILD URL PROPERLY
    let url = "/api/posts";

    if (pageParam) {
      url += `?cursor=${pageParam}`;
    }

    if (publicId) {
      url += pageParam
        ? `&publicId=${publicId}`
        : `?publicId=${publicId}`;
    }

    // ✅ FETCH DATA
    const res = await fetch(url);

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