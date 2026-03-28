"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostCard from "./components/PostCard";

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

  // ✅ ADD THIS (SCROLL RESTORE CONTROL)
  const restoredRef = useRef(false);

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

  // ✅ ADD THIS (ACTUAL FIX)
  useEffect(() => {

    if (restoredRef.current) return;

    const savedScroll = sessionStorage.getItem("feedScroll");

    if (!savedScroll) return;
    if (posts.length === 0) return;

    restoredRef.current = true;

    requestAnimationFrame(() => {
      window.scrollTo(0, Number(savedScroll));
    });

  }, [posts]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredPosts(posts);
    }
  }, [posts]);

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

  const handleScroll = useCallback(() => {

    setShowNewBtn(window.scrollY > 300);

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

  return (

    <div
      style={{
        width: "100%",
        maxWidth: "680px",
        margin: "0 auto",
        padding: "6px 12px 110px"
      }}
    >

      {/* 🔥 PREMIUM SEARCH */}

      <div
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 90,
          padding: "6px 6px",
          background: "rgba(11,11,12,0.85)",
          backdropFilter: "blur(10px)"
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: "14px",
            outline: "none",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
            transition: "all 0.25s ease"
          }}
        />
      </div>

      {/* POSTS */}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredPosts.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>

      {/* LOADING (UNCHANGED) */}

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