"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        Searching...
      </div>
    );
  }

  return (
    <main style={{ maxWidth: "720px", margin: "20px auto", padding: "10px" }}>
      <h3 style={{ marginBottom: "12px" }}>
        Results for #{query}
      </h3>

      {posts.length === 0 && (
        <div style={{ color: "#777" }}>
          No posts found
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </main>
  );
}