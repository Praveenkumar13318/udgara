function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPosts({ pageParam = null }: { pageParam?: number | null }) {
  const url = pageParam ? `/api/posts?cursor=${pageParam}` : "/api/posts";

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return {
    posts: Array.isArray(data.posts) ? data.posts : [],
    nextCursor: data.nextCursor ?? null,
  };
}

export async function fetchPost(postId: string) {
  const res = await fetch(`/api/posts?postId=${postId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Post not found");
  }
  return (await res.json()).post;
}

export async function createPost(content: string, image?: string) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content, image }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create post");
  return data;
}

export async function deletePost(postId: string) {
  const res = await fetch("/api/posts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ postId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to delete post");
  return data;
}

export async function toggleLike(postId: string) {
  const res = await fetch("/api/like", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ postId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to like post");
  return data;
}

export async function fetchComments(postId: string) {
  const res = await fetch(`/api/comments?postId=${postId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load comments");
  return (await res.json()).comments ?? [];
}

export async function postComment(postId: string, content: string) {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ postId, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to post comment");
  return data;
}
