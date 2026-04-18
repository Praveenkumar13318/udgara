"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import PostCard from "../components/PostCard";
import { fetchPosts } from "../lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PostClient from "../post/[id]/PostClient";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../lib/pusherClient";

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

export default function HomeWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
export async function generateMetadata({ searchParams }: any) {
  const postId = searchParams?.post;

  return {
    title: "Udgara",
    description: "Check this post",
    openGraph: {
      title: "Udgara",
      description: "View this post",
      images: [`/og?postId=${postId}`]
    }
  };
}
function Home() {

  const [reportOpen, setReportOpen] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const checkNewPosts = async () => {
  try {
    const res = await fetch("/api/posts?limit=1");
const latestData = await res.json();
if (!latestData?.posts) return;
const latest = latestData?.posts?.[0];
const feedData: any = queryClient.getQueryData(["feed"]);
const current = feedData?.pages?.[0]?.posts?.[0];

    if (latest && current && latest.postId !== current.postId) {
      setShowNewBtn(true);
    }
  } catch (e) {
    console.log("check error", e);
  }
};

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length > 0;
  const [showNewBtn, setShowNewBtn] = useState(false);
const router = useRouter();
const queryClient = useQueryClient();
  const searchParams = useSearchParams();
const activePostId = searchParams.get("post");
useEffect(() => {
  if (activePostId) {
    // LOCK BACKGROUND SCROLL
    document.body.style.overflow = "hidden";
  } else {
    // RESTORE NORMAL
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [activePostId]);

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

  staleTime: 0, // ✅ prevents refetch spam
  gcTime: 1000 * 60 * 10,   // ✅ keeps cache alive
  refetchOnMount: false,
refetchOnWindowFocus: true,
});  
 const isInitialLoading = !data && isLoading;
  useEffect(() => {

    const delay = setTimeout(async () => {

      if (!search.trim()) {
  setFilteredPosts([]);
  return;
}

      try {
        const res = await fetch(`/api/search?q=${search}`);
        const result = await res.json();

const safeData: Post[] = Array.isArray(result?.data)
  ? result.data
  : [];

setFilteredPosts(safeData.slice(0, 20));

      } catch (err) {
        console.log("Search error", err);
      }

    }, 400);

    return () => clearTimeout(delay);

  }, [search]);
 
 const handleScroll = useCallback(() => {
  if (loadingRef.current) return;

  if (
    hasNextPage &&
    !isFetchingNextPage &&
    window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 200
  ) {
    loadingRef.current = true;

    fetchNextPage().finally(() => {
      loadingRef.current = false;
    });
  }
}, [hasNextPage, isFetchingNextPage]);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
 useEffect(() => {
  const interval = setInterval(() => {
    checkNewPosts();
  }, 8000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (reportOpen) {
    document.body.style.overflow = "hidden"; // 🚫 stop scroll
  } else {
    document.body.style.overflow = ""; // ✅ allow scroll
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [reportOpen]);

useEffect(() => {
  if (!pusherClient) return;

  const channel = pusherClient.subscribe("posts");

  const handler = (data: any) => {
    queryClient.setQueryData(["feed"], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((p: any) => {
            if (p.postId === data.postId) {
              return {
                ...p,
                likes: data.likeCount,
              };
            }
            return p;
          }),
        })),
      };
    });
  };

  channel.bind("like-update", handler);

  
}, []);
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
  <button
    onMouseDown={(e) => e.preventDefault()} // 🔥 BLOCK FOCUS
    onClick={async () => {
  const res = await fetch("/api/posts?limit=10");
  const fresh = await res.json();

  queryClient.setQueryData(["feed"], {
    pages: [{ posts: fresh.data }],
    pageParams: []
  });

  setShowNewBtn(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
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
      zIndex: 1000,
      border: "none"
    }}
  >
    ↑ New Posts
  </button>
)}
      {/* POSTS */}
<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

  {/* 🔥 SKELETON BUFFER LOADING */}
  {isInitialLoading && (
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
{!isInitialLoading && isSearching && (
  <>
    {filteredPosts.map((post: any) => (
      <PostCard key={post.postId} post={post} />
    ))}

    {search.trim() && filteredPosts.length === 0 && (
  <div style={{ textAlign: "center", color: "#777", padding: "20px" }}>
    No results found
  </div>
)}
  </>
)}

{/* 🔥 NORMAL FEED */}
{!isInitialLoading && !isSearching && (
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
    {activePostId && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "#0b0b0c",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      animation: "slideUp 0.25s ease"
    }}
  >
    {/* HEADER */}
    <div
      style={{
        position: "sticky",
        top: 0,
        background: "#0b0b0c",
        padding: "12px 16px",
        borderBottom: "1px solid #1f1f1f",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: 600 }}>
        Post
      </span>

      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        ✕
      </button>
    </div>

    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
  <PostClient postId={activePostId} />
</div>
  </div>
)}

<style jsx global>{`
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`}</style>
   </div>
    );
  }