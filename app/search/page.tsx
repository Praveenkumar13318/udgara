"use client";

import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

export default function SearchPage() {

  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";

    setQuery(q);

    if (!q) {
      setLoading(false);
      return;
    }

    fetch(`/api/search?q=${q}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, []);

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