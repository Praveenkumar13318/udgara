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
      const tag = part.substring(1);

      return (
        <span
          key={i}
          style={{
  color: "#1e90ff",
  cursor: "pointer",
  fontWeight: 500,
  textDecoration: "underline"
}}
          onClick={(e) => {
            e.stopPropagation(); // 🔥 VERY IMPORTANT (prevents post open)
            e.preventDefault();
            router.push(`/search?q=${tag}`);
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

  const channel = pusherClient.subscribe("posts");

  const likeHandler = (data: any) => {
    console.log("PUSHER EVENT RECEIVED:", data);

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
  const [animating, setAnimating] = useState(false);
  

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
setAnimating(true);
setTimeout(() => setAnimating(false), 120);
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

    const url = window.location.origin + "/post/" + post.postId;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Udgara Post", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      console.log("Link copied");
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
  id={`post-${post.postId}`} // 🔥 ADD THIS LINE
  style={{
    padding: "16px 16px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)"
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
                gap: "6px"
              }}
            >
              <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  style={{
    transform: animating ? "scale(1.25)" : "scale(1)",
    transition: "transform 0.18s ease"
  }}
>
                <path
                  d="M16.697 5.5c-1.222 0-2.404.724-2.997 1.86-.593-1.136-1.775-1.86-2.997-1.86-1.93 0-3.5 1.57-3.5 3.5 0 4.25 6.497 8.5 6.497 8.5s6.497-4.25 6.497-8.5c0-1.93-1.57-3.5-3.5-3.5z"
                  fill={liked ? "#ff2d55" : "none"}
                  stroke={liked ? "#ff2d55" : "#888"}
                  strokeWidth="1.6"
                />
              </svg>

              <span style={{ fontSize: "13px" }}>
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
                gap: "6px"
              }}
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
  onClick={() => {
    setShowReport(false);
    setReportOpen(false);
  }}
  style={{
    position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
  onClick={(e) => e.stopPropagation()} // 🔥 IMPORTANT
  style={{
    width: "320px",
              background: "#1a1a1a",
              borderRadius: "14px",
              padding: "18px"
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Report Post</h3>

            {reasons.map((r) => (
              <label key={r} style={{ display: "block", marginBottom: "6px" }}>
                <input
                  type="radio"
                  onChange={() => setSelectedReason(r)}
                />{" "}
                {r}
              </label>
            ))}

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button className="tap" onClick={submitReport}>Submit</button>
              <button className="tap" onClick={() => {
  setShowReport(false);
  setReportOpen(false); // 🔥 ADD THIS
}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}