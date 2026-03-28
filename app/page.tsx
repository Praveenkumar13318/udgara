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

// ✅ disable browser scroll restore
if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

export default function Home() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [showNewBtn, setShowNewBtn] = useState(false);

  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const restoredRef = useRef(false);

  /* ================= INITIAL LOAD WITH CACHE ================= */

  useEffect(() => {
    const publicId = localStorage.getItem("publicId");
    if (!publicId) return;

    // ✅ LOAD CACHE FIRST (VERY IMPORTANT)
    const cached = sessionStorage.getItem("feedCache");

    if (cached) {
      const parsed = JSON.parse(cached);
      setPosts(parsed);
      setFilteredPosts(parsed);
    }

    // fetch latest in background
    loadPosts(null, publicId);

  }, []);

  /* ================= LOAD POSTS ================= */

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
        setFilteredPosts(newPosts);

        // ✅ SAVE CACHE
        sessionStorage.setItem("feedCache", JSON.stringify(newPosts));

      } else {
        setPosts(prev => {
          const map = new Map<string, Post>();
          prev.forEach(p => p?.postId && map.set(p.postId, p));
          newPosts.forEach(p => p?.postId && map.set(p.postId, p));

          const merged = Array.from(map.values());

          // ✅ UPDATE CACHE
          sessionStorage.setItem("feedCache", JSON.stringify(merged));

          return merged;
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

  /* ================= RESTORE POSITION (FINAL FIX) ================= */

  useEffect(() => {
    if (restoredRef.current) return;

    const lastPostId = sessionStorage.getItem("lastPostId");
    if (!lastPostId) return;

    if (posts.length === 0) return;

    // wait for DOM stability (important)
    setTimeout(() => {
      const el = document.getElementById(`post-${lastPostId}`);

      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "center"
        });

        restoredRef.current = true;
      }
    }, 50);

  }, [posts]);

  /* ================= SEARCH ================= */

  useEffect(() => {
    if (!search.trim()) {
      setFilteredPosts(posts);
    }
  }, [posts]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) return;

      try {
        const res = await fetch(`/api/search?q=${search}`);
        const data = await res.json();
        setFilteredPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Search error", err);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

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

      // update cache
      sessionStorage.setItem("feedCache", JSON.stringify(newPosts));

      setCursor(data.nextCursor || null);
      setHasMore(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.log("REFRESH ERROR:", err);
    }
  }

  /* ================= SCROLL ================= */

  const handleScroll = useCallback(() => {

    const scrollY = window.scrollY;

    sessionStorage.setItem("feedScroll", scrollY.toString());

    setShowNewBtn(scrollY > 300);

    if (
      hasMore &&
      !loadingRef.current &&
      window.innerHeight + scrollY >=
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
        padding: "6px 12px 110px"
      }}
    >

      {/* SEARCH */}

      <div
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 90,
          padding: "6px",
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
            outline: "none"
          }}
        />
      </div>

      {/* NEW POSTS */}

      {showNewBtn && (
        <div
          onClick={refreshPosts}
          style={{
            position: "fixed",
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e90ff",
            color: "white",
            padding: "7px 14px",
            borderRadius: "18px",
            fontSize: "12px",
            cursor: "pointer",
            zIndex: 1000
          }}
        >
          ↑ New Posts
        </div>
      )}

      {/* POSTS */}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredPosts.map((post) => (
          <div id={`post-${post.postId}`} key={post.postId}>
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* LOADING */}

      {loading && (
        <div style={{ textAlign: "center", padding: "18px" }}>
          Loading...
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
          cursor: "pointer"
        }}
      >
        Create Post
      </button>

    </div>
  );
}