"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostCard from "./components/PostCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "./lib/api";
import { useRouter } from "next/navigation";
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

  
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length > 0;
  const [showNewBtn, setShowNewBtn] = useState(false);
const router = useRouter();
  

  const loadingRef = useRef(false);
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey: ["feed"],

  queryFn: ({ pageParam = null }: any) =>
    fetchPosts({ pageParam }),

  initialPageParam: null,

  getNextPageParam: (lastPage: any) =>
    lastPage.nextCursor || undefined,

  staleTime: 1000 * 60 * 2, // ✅ prevents refetch spam
  gcTime: 1000 * 60 * 10,   // ✅ keeps cache alive
});  
 
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
  useEffect(() => {
  const anchorId = sessionStorage.getItem("anchorPostId");
  if (!anchorId) return;

  let attempts = 0;

  const tryScroll = () => {
    const el = document.getElementById(`post-${anchorId}`);

    if (el) {
      el.scrollIntoView({
        behavior: "auto",
        block: "center",
      });

      sessionStorage.removeItem("anchorPostId");
      return;
    }

    if (attempts < 15) { // 🔥 increased retries
      attempts++;
      requestAnimationFrame(tryScroll); // 🔥 smoother than setTimeout
    }
  };

  requestAnimationFrame(tryScroll);

}, [data]);

  const handleScroll = useCallback(() => {

    setShowNewBtn(window.scrollY > 300);

    if (
  hasNextPage &&
  !isFetchingNextPage &&
  window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 200
) {
  fetchNextPage();
}

  }, [hasNextPage, isFetchingNextPage]);

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
        padding: "6px 12px 110px" // 🔥 gap fixed
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
          onFocus={(e: any) => {
            e.currentTarget.style.border = "1px solid #1e90ff";
            e.currentTarget.style.background = "rgba(30,144,255,0.08)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,144,255,0.15)";
          }}
          onBlur={(e: any) => {
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.4)";
          }}
        />
      </div>

      {/* NEW POSTS BUTTON */}

      {showNewBtn && (
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
            fontWeight: 500,
            cursor: "pointer",
            zIndex: 1000
          }}
        >
          ↑ New Posts
        </div>
      )}

      {/* POSTS */}
<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

  {/* 🔥 SKELETON BUFFER LOADING */}
  {isLoading && (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            animation: "pulse 1.2s infinite"
          }}
        >
          {/* username */}
          <div
            style={{
              width: "30%",
              height: "10px",
              background: "#222",
              borderRadius: "6px",
              marginBottom: "10px"
            }}
          />

          {/* content lines */}
          <div
            style={{
              width: "90%",
              height: "12px",
              background: "#222",
              borderRadius: "6px",
              marginBottom: "6px"
            }}
          />

          <div
            style={{
              width: "70%",
              height: "12px",
              background: "#222",
              borderRadius: "6px"
            }}
          />
        </div>
      ))}
    </>
  )}

  {/* 🔍 SEARCH MODE */}
{!isLoading && isSearching && (
  <>
    {filteredPosts.map((post: any) => (
      <PostCard key={post.postId} post={post} />
    ))}

    {filteredPosts.length === 0 && (
      <div style={{ textAlign: "center", color: "#777", padding: "20px" }}>
        No results found
      </div>
    )}
  </>
)}

{/* 🔥 NORMAL FEED */}
{!isLoading && !isSearching && (
  <>
    {(data?.pages?.flatMap((page: any) => page.posts || []) ?? []).map((post: any) => (
      <PostCard key={post.postId} post={post} />
    ))}
  </>
)}
</div>
      {/* LOADING */}

      {isFetchingNextPage && (
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
      onClick={() => router.push("/create")}
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

     <style>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`}</style>
    </div>
  );
}