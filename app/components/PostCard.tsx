"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

export default function PostCard({ post }: any) {
  const publicId =
  typeof window !== "undefined"
    ? localStorage.getItem("publicId")
    : null;

const isOwner = publicId && publicId === post.npId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showReport, setShowReport] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(post.isLiked || false);
  const comments = post.commentsCount || 0;

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

    const publicId = localStorage.getItem("publicId");
    if (!publicId) {
      router.push("/login");
      return;
    }
const optimisticLiked = !liked;
const optimisticCount = optimisticLiked ? likes + 1 : likes - 1;

setLiked(optimisticLiked);
setLikes(optimisticCount);
    

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.postId,
          publicId
        })
      });

      const data = await res.json();

      if (data.success) {
  const isLikedNow = data.action === "liked";

  setLiked(isLikedNow);
  setLikes(data.likeCount);

  // 🔥 SYNC HOME FEED
  queryClient.setQueryData(["feed"], (old: any) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        posts: page.posts.map((p: any) =>
          p.postId === post.postId
            ? {
                ...p,
                likes: data.likeCount,
                isLiked: isLikedNow
              }
            : p
        )
      }))
    };
  });
  queryClient.invalidateQueries({ queryKey: ["feed"] });
}

    } catch (err) {
      console.log("LIKE ERROR:", err);
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
      alert("Link copied!");
    }
  }

  /* ================= REPORT ================= */
  async function submitReport() {
    if (!selectedReason) {
      alert("Select reason");
      return;
    }

    try {

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.postId,
          reason: selectedReason
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Report failed:", data);
        alert("Failed to report post");
        return;
      }

      setShowReport(false);
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
    const res = await fetch("/api/posts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: post.postId,
        publicId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["feed"] });

  } catch (err) {
    console.log("Delete error", err);
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
  sessionStorage.setItem("scrollY", String(window.scrollY));
router.push(`/post/${post.postId}`);
  
}}
          className="tap no-select"
          style={{
            color: "#eaeaea",
            marginBottom: "12px",
            lineHeight: "1.5",
            fontSize: "15px"
          }}
        >
          {post.content}
        </div>

        {/* IMAGE */}
        {post.image && (
          <div
            onClick={() => {
  sessionStorage.setItem("scrollY", String(window.scrollY));
router.push(`/post/${post.postId}`);
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
              <svg width="20" height="20" viewBox="0 0 24 24">
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
                sessionStorage.setItem("scrollY", String(window.scrollY));
router.push(`/post/${post.postId}`);
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
                {comments}
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
  {post.npId === localStorage.getItem("publicId")?.toUpperCase() && (
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
              <button className="tap" onClick={() => setShowReport(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}