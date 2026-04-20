"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../lib/fetcher";
import { pusherClient } from "../lib/pusherClient";
/* ================= TIME ================= */
function timeAgo(dateString: any) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 }
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count > 0) return count + i.label + " ago";
  }

  return "now";
}

export default function PostCard({ post, setReportOpen }: any) {
  const [isLiking, setIsLiking] = useState(false);
  const publicId =
  typeof window !== "undefined"
    ? localStorage.getItem("publicId")
    : null;

const isOwner = publicId && publicId === post.npId;
  const router = useRouter();
  function renderText(text: string) {
  return text.split(/(#[\w-]+)/g).map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(`/search?q=${part.substring(1)}`);
          }}
          style={{
    color: "#1e90ff",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "6px",
    background: "rgba(30,144,255,0.1)",
    transition: "background 0.15s ease, transform 0.12s ease",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  }}
onTouchStart={(e) => {
    (e.currentTarget as HTMLElement).style.background = "rgba(30,144,255,0.28)";
    (e.currentTarget as HTMLElement).style.transform = "scale(0.94)";
  }}
onTouchEnd={(e) => {
    (e.currentTarget as HTMLElement).style.background = "rgba(30,144,255,0.1)";
    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
  }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}
  const queryClient = useQueryClient();
  useEffect(() => {
  if (!pusherClient) return;

  const channel = pusherClient.channel("posts") || pusherClient.subscribe("posts");
  const likeHandler = (data: any) => {
    

    if (data.postId === post.postId) {
      setLikes(data.likeCount);
      setLiked(data.action === "liked"); // ✅ FIXED
    }
  };

  const commentHandler = (data: any) => {
    if (data.postId === post.postId) {
      setCommentsCount(data.commentsCount);
    }
  };

  channel.bind("like-update", likeHandler);
  channel.bind("comment-update", commentHandler);

  return () => {
  channel.unbind("like-update", likeHandler);
  channel.unbind("comment-update", commentHandler);

 
};
}, [post.postId]);

  const [showReport, setShowReport] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const [likes, setLikes] = useState(post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [liked, setLiked] = useState(post.isLiked || false);
  const [animating, setAnimating] = useState<"idle"|"pop"|"settle">("idle");
  

  const reasons = [
    "Spam",
    "Harassment",
    "Hate speech",
    "Violence",
    "Misinformation",
    "Other"
  ];

  /* ================= LIKE ================= */
  async function handleLike(e: any) {
  e.stopPropagation();
  e.preventDefault();

  if (isLiking) return; 
  
  setIsLiking(true);
setAnimating("pop");
setTimeout(() => setAnimating("settle"), 120);
setTimeout(() => setAnimating("idle"), 220);
    const token = localStorage.getItem("token");
if (!token) {
  setIsLiking(false);   // ✅ ADD BACK
  router.push("/login");
  return;
}
const prevLiked = liked;
const prevLikes = likes;

const optimisticLiked = !prevLiked;
const optimisticCount = prevLiked ? prevLikes - 1 : prevLikes + 1;

setLiked(optimisticLiked);
setLikes(optimisticCount); // ✅ ADD THIS BACK

    

    try {
      const res = await fetchWithAuth("/api/like", {
  method: "POST",
  body: JSON.stringify({
    postId: post.postId
  })
});

      const data = await res.json();

      if (data.success) {
  
  
}
else {
  setLiked(prevLiked);
  setLikes(prevLikes);
}
    }
     catch (err) {
  console.log("LIKE ERROR:", err);

  // ✅ REVERT UI (VERY IMPORTANT)
  setLiked(prevLiked);
setLikes(prevLikes);
  
}finally {
  setIsLiking(false);
}
  }

  /* ================= SHARE ================= */
 async function handleShare(e: any) {
  e.stopPropagation();
  e.preventDefault();

  const url = `${window.location.origin}/post/${post.postId}`;
  const text = `${post.npId?.toUpperCase()} on Udgara:\n"${post.content?.slice(0, 80)}${post.content?.length > 80 ? "..." : ""}"`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${post.npId?.toUpperCase()} on Udgara`,
        text,
        url,
      });
    } catch {}
  } else {
    await navigator.clipboard.writeText(url);
  }
}

  /* ================= REPORT ================= */
  async function submitReport() {
    if (!selectedReason) {
      alert("Select reason");
      return;
    }

    try {

      const res = await fetchWithAuth("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  postId: post.postId,
  reason: selectedReason,
  npId: publicId // 🔥 REQUIRED
})
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Report failed:", data);
        alert("Failed to report post");
        return;
      }

      setShowReport(false);
setReportOpen(false); // 🔥 ADD THIS
      setSelectedReason("");

    } catch (error) {
      console.error("Report error:", error);
      alert("Network error while reporting");
    }
  }
async function handleDelete() {
  const confirmDelete = window.confirm("Delete this post?");
  if (!confirmDelete) return;

  try {
    const res = await fetchWithAuth("/api/posts", {
  method: "DELETE",
  body: JSON.stringify({
    postId: post.postId,
  }),
});

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    queryClient.setQueryData(["feed"], (old: any) => {
  if (!old) return old;

  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      posts: page.posts.filter((p: any) => p.postId !== post.postId)
    }))
  };
});
router.push("/");

  } catch (err) {
    console.log("Delete error", err);
  }
  finally {
  setIsLiking(false);
}
}
  return (
    <>
      <div
  id={`post-${post.postId}`}
  style={{
    padding: "16px 16px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    transition: "background 0.15s ease",
    WebkitTapHighlightColor: "transparent",
  }}
>

        {/* HEADER */}
        <div
          style={{
            fontSize: "13px",
            color: "#777",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span
            className="tap no-select"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push(`/profile/${post.npId}`);
            }}
            style={{
              color: "#fff",
              fontWeight: 600
            }}
          >
            {post.npId?.toUpperCase()}
          </span>

          <span style={{ color: "#555" }}>•</span>

          <span style={{ color: "#888" }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* CONTENT */}
        <div
          onClick={() => {
  


router.push(`/?post=${post.postId}`, { scroll: false });
  
}}
          className="tap no-select"
          style={{
            color: "#eaeaea",
            marginBottom: "12px",
            lineHeight: "1.5",
            fontSize: "15px"
          }}
        >
          {renderText(post.content)}
        </div>

        {/* IMAGE */}
        {post.image && (
          <div
            onClick={() => {
  


router.push(`/?post=${post.postId}`, { scroll: false });
}}
            className="tap no-select"
            style={{
              borderRadius: "14px",
              overflow: "hidden",
              marginBottom: "12px"
            }}
          >
            <img
  src={post.image}
  style={{
    width: "100%",
    maxHeight: "420px",
    objectFit: "cover"
  }}
/>
          </div>
        )}

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <div style={{ display: "flex", gap: "22px", alignItems: "center" }}>

            {/* LIKE */}
            <div
  onClick={handleLike}
  className="tap no-select"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    borderRadius: "8px",
    margin: "-6px -8px",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    transition: "background 0.15s ease",
  }}
  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,45,85,0.08)")}
  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
>
              <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  style={{
    transform: animating === "pop" ? "scale(1.45)" : animating === "settle" ? "scale(1.08)" : "scale(1)",
    transition: animating === "pop" ? "transform 0.1s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0.15s ease-out",
    filter: "none",
  }}
>
                <path
  d="M16.697 5.5c-1.222 0-2.404.724-2.997 1.86-.593-1.136-1.775-1.86-2.997-1.86-1.93 0-3.5 1.57-3.5 3.5 0 4.25 6.497 8.5 6.497 8.5s6.497-4.25 6.497-8.5c0-1.93-1.57-3.5-3.5-3.5z"
  style={{
    fill: liked ? "#ff2d55" : "transparent",
    stroke: liked ? "#ff2d55" : "#555",
    strokeWidth: "1.6",
    transition: "fill 0.2s ease, stroke 0.2s ease",
  }}
/>
              </svg>

              <span style={{
  fontSize: "13px",
  fontWeight: liked ? 600 : 400,
  transition: "transform 0.2s ease, color 0.25s ease, font-weight 0.2s ease",
  display: "inline-block",
  transform: animating === "pop" ? "translateY(-2px) scale(1.1)" : "translateY(0) scale(1)",
  color: liked ? "#ff2d55" : "#555",
  minWidth: "16px",
}}>
  {likes}
</span>
            </div>

            {/* COMMENT */}
            <div
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/?post=${post.postId}`, { scroll: false });
  }}
  className="tap no-select"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    borderRadius: "8px",
    margin: "-6px -8px",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    transition: "background 0.15s ease",
  }}
  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M4 4h16v12H8l-4 4V4z"
                  fill="none"
                  stroke="#888"
                  strokeWidth="1.6"
                />
              </svg>

              <span style={{ fontSize: "13px" }}>
                {commentsCount}
              </span>
            </div>

            {/* SHARE */}
           <div
  onClick={handleShare}
  className="tap no-select"
  style={{
    padding: "6px 8px",
    borderRadius: "8px",
    margin: "-6px -8px",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    transition: "background 0.15s ease",
  }}
  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M12 3v12M12 3l4 4M12 3l-4 4M5 15v4h14v-4"
                  fill="none"
                  stroke="#888"
                  strokeWidth="1.6"
                />
              </svg>
            </div>

          </div>

         <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>

  {/* DELETE BUTTON */}
  {isOwner && (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleDelete();
      }}
      style={{
        color: "#ff4d4d",
        fontSize: "13px",
        cursor: "pointer",
        fontWeight: 500
      }}
    >
      Delete
    </div>
  )}

  {/* REPORT BUTTON */}
  <div
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      setShowReport(true);
setReportOpen(true); // 🔥 ADD THIS
    }}
    className="tap no-select"
  >
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M5 3v18M5 3h12l-2 4 2 4H5"
        fill="none"
        stroke="#ff4d4d"
        strokeWidth="1.6"
      />
    </svg>
  </div>

</div>
        </div>

      </div>

      {/* REPORT MODAL (UNCHANGED LOGIC) */}
      {showReport && (
  <div
    onClick={() => { setShowReport(false); setReportOpen(false); }}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      zIndex: 9999,
      padding: "0 0 24px",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "480px",
        background: "#141414",
        borderRadius: "20px 20px 0 0",
        padding: "8px 0 0",
      }}
    >
      {/* drag handle */}
      <div style={{
        width: "36px",
        height: "4px",
        background: "#2a2a2a",
        borderRadius: "2px",
        margin: "0 auto 20px",
      }} />

      <div style={{
        fontSize: "13px",
        fontWeight: 600,
        color: "#555",
        letterSpacing: "0.5px",
        padding: "0 20px 12px",
        textTransform: "uppercase",
      }}>
        Report post
      </div>

      {["Spam", "Harassment", "Hate speech", "Violence", "Misinformation", "Other"].map((r) => (
        <div
          key={r}
          onClick={() => setSelectedReason(r)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            cursor: "pointer",
            background: selectedReason === r ? "rgba(255,255,255,0.04)" : "transparent",
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <span style={{ fontSize: "15px", color: "#e5e5e5" }}>{r}</span>
          <div style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: selectedReason === r ? "2px solid #1e90ff" : "2px solid #333",
            background: selectedReason === r ? "#1e90ff" : "transparent",
            flexShrink: 0,
          }} />
        </div>
      ))}

      <div style={{ padding: "16px 20px 8px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => { setShowReport(false); setReportOpen(false); setSelectedReason(""); }}
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "999px",
            border: "1px solid #2a2a2a",
            background: "transparent",
            color: "#888",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={submitReport}
          disabled={!selectedReason}
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "999px",
            border: "none",
            background: selectedReason ? "#ff4d4d" : "#1c1c1c",
            color: selectedReason ? "#fff" : "#444",
            fontSize: "14px",
            fontWeight: 600,
            cursor: selectedReason ? "pointer" : "not-allowed",
          }}
        >
          Report
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}