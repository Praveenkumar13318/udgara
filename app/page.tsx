"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostCard from "./components/PostCard";

/* ================= TYPES ================= */

type Post = {
  postId: string;
  npId: string;
  content: string;
  image?: string;
  likes?: number;
  commentsCount?: number;
  createdAt?: string;
  createdAtMs?: number;
};

export default function Home() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [showNewBtn, setShowNewBtn] = useState(false);

  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    const publicId = localStorage.getItem("publicId");
    if (!publicId) return;
    loadPosts(null, publicId);
  }, []);

  async function loadPosts(
    customCursor: number | null = cursor,
    overridePublicId?: string
  ) {

    if (loadingRef.current) return;
    loadingRef.current = true;

    setLoading(true);

    try {

      const publicId =
        overridePublicId || localStorage.getItem("publicId");

      if (!publicId) return;

      const url = customCursor
        ? `/api/posts?cursor=${customCursor}&publicId=${publicId}`
        : `/api/posts?publicId=${publicId}`;

      const res = await fetch(url);
      const data = await res.json();

      const newPosts: Post[] = data.posts || [];
      const nextCursor = data.nextCursor || null;

      if (!customCursor) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const map = new Map<string, Post>();

          prev.forEach((p) => p?.postId && map.set(p.postId, p));
          newPosts.forEach((p) => p?.postId && map.set(p.postId, p));

          return Array.from(map.values());
        });
      }

      setCursor(nextCursor);
      if (!nextCursor) setHasMore(false);

    } catch (err) {
      console.log("LOAD ERROR:", err);
    }

    setLoading(false);
    loadingRef.current = false;
  }

  /* ================= SYNC FILTERED POSTS ================= */

  useEffect(() => {
    if (!search.trim()) {
      setFilteredPosts(posts);
    }
  }, [posts]);

  /* ================= REFRESH ================= */

  async function refreshPosts() {
    try {
      const publicId = localStorage.getItem("publicId");
      if (!publicId) return;

      const res = await fetch(`/api/posts?publicId=${publicId}`);
      const data = await res.json();

      const newPosts: Post[] = data.posts || [];

      setPosts(newPosts);
      setFilteredPosts(newPosts);

      setCursor(data.nextCursor || null);
      setHasMore(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.log("REFRESH ERROR:", err);
    }
  }

  /* ================= SEARCH ================= */

  useEffect(() => {

    const delay = setTimeout(async () => {

      if (!search.trim()) return;

      try {
        const res = await fetch(`/api/search?q=${search}`);
        const data = await res.json();

        const safeData: Post[] = Array.isArray(data) ? data : [];
        setFilteredPosts(safeData);

      } catch (err) {
        console.log("Search error", err);
      }

    }, 400);

    return () => clearTimeout(delay);

  }, [search]);

  /* ================= SCROLL ================= */

  const handleScroll = useCallback(() => {

    if (window.scrollY > 300) {
      setShowNewBtn(true);
    } else {
      setShowNewBtn(false);
    }

    if (
      hasMore &&
      !loadingRef.current &&
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 200
    ) {
      loadPosts(cursor);
    }

  }, [cursor, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ================= UI ================= */

  return (

    <div
      style={{
        width: "100%",
        maxWidth: "680px",
        margin: "0 auto",
        padding: "8px 12px 110px"
      }}
    >

      {/* SEARCH */}

      <div
        style={{
          position: "sticky",
          top: "60px",
          zIndex: 90,
          background: "#0b0b0c",
          padding: "10px 12px",
          borderBottom: "1px solid #1f1f1f",
          marginBottom: "8px"
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          onFocus={(e: any) => e.currentTarget.style.border = "1px solid #1e90ff"}
          onBlur={(e: any) => e.currentTarget.style.border = "1px solid #262626"}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #262626",
            background: "#141414",
            color: "#fff",
            fontSize: "14px",
            outline: "none",
            transition: "all 0.2s ease"
          }}
        />
      </div>

      {/* NEW POSTS BUTTON */}

      {showNewBtn && (
        <div
          onClick={refreshPosts}
          style={{
            position: "fixed",
            top: "72px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e90ff",
            color: "white",
            padding: "7px 14px",
            borderRadius: "18px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 6px 16px rgba(0,0,0,0.3)"
          }}
        >
          ↑ New Posts
        </div>
      )}

      {/* POSTS */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "4px"
        }}
      >
        {filteredPosts.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>

      {/* LOADING */}

      {loading && (
        <div style={{ textAlign: "center", padding: "18px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              border: "3px solid #333",
              borderTop: "3px solid #1e90ff",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 0.8s linear infinite"
            }}
          />
        </div>
      )}

      {/* CREATE BUTTON */}

      <button
        onClick={() => window.location.href = "/create"}
        style={{
          position: "fixed",
          bottom: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "13px 24px",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(135deg,#1e90ff,#0066ff)",
          color: "white",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
          zIndex: 1000
        }}
      >
        Create Post
      </button>

      {/* SPINNER */}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

    </div>
  );
}