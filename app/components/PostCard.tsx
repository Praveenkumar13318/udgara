"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TIME FORMATTER ================= */

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

  const router = useRouter();

  const [showReport, setShowReport] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const [likes, setLikes] = useState<number>(post.likes || 0);
  const [liked, setLiked] = useState(post.isLiked || false);
  const comments = post.commentsCount || 0;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);

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

    const el = e.currentTarget;
    const publicId = localStorage.getItem("publicId");

    if (!publicId) {
      router.push("/login");
      return;
    }

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
        setLiked(data.action === "liked");
        setLikes(data.likeCount);

        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 200);
      }

    } catch (err) {
      console.log("LIKE ERROR:", err);
    }

    if (el) {
      el.style.transform = "scale(1.1)";
      setTimeout(() => {
        el.style.transform = "scale(1)";
      }, 120);
    }
  }

  /* ================= SHARE ================= */

  async function handleShare(e: any) {
    e.stopPropagation();

    const shareUrl = window.location.origin + "/post/" + post.postId;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Udgara Post",
          url: shareUrl
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    }
  }

  /* ================= REPORT ================= */

  async function submitReport() {
    if (!selectedReason) {
      alert("Select a reason");
      return;
    }

    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: post.postId,
        reason: selectedReason
      })
    });

    setShowReport(false);
    setSelectedReason("");
  }

  /* ================= UI ================= */

  return (
    <>
      <div
        style={{
          padding: "14px 0",
          borderBottom: "1px solid #1f1f1f"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            fontSize: "13px",
            color: "#777",
            marginBottom: "6px"
          }}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/${post.npId}`);
            }}
            style={{
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {post.npId?.toUpperCase()}
          </span>

          {" • "}
          {timeAgo(post.createdAt)}
        </div>

        {/* CONTENT */}
        <div
          onClick={() => {
            fetch("/api/view", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId: post.postId })
            });

            router.push(`/post/${post.postId}`);
          }}
          style={{
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#eaeaea",
            marginBottom: "10px",
            wordBreak: "break-word",
            cursor: "pointer"
          }}
        >
          {post.content}
        </div>

        {/* IMAGE */}
        {post.image && (
          <div
            onClick={() => router.push(`/post/${post.postId}`)}
            style={{
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "10px",
              background: imageLoaded ? "transparent" : "#1f1f1f",
              cursor: "pointer"
            }}
          >
            {!imageLoaded && (
              <div style={{ height: "200px", background: "#222" }} />
            )}

            <img
              src={post.image}
              onLoad={() => setImageLoaded(true)}
              style={{
                width: "100%",
                display: imageLoaded ? "block" : "none",
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
            alignItems: "center",
            marginTop: "6px"
          }}
        >
          <div style={{ display: "flex", gap: "22px" }}>

            {/* LIKE */}
            <div onClick={handleLike} style={{ cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M16.697 5.5c-1.222 0-2.404.724-2.997 1.86-.593-1.136-1.775-1.86-2.997-1.86-1.93 0-3.5 1.57-3.5 3.5 0 4.25 6.497 8.5 6.497 8.5s6.497-4.25 6.497-8.5c0-1.93-1.57-3.5-3.5-3.5z"
                  fill={liked ? "#ff2d55" : "none"}
                  stroke={liked ? "#ff2d55" : "#888"}
                  strokeWidth="1.6"
                />
              </svg>
              <span>{likes}</span>
            </div>

            {/* COMMENT */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.postId}`);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M4 4h16v12H8l-4 4V4z" fill="none" stroke="#888" strokeWidth="1.6"/>
              </svg>
              <span>{comments}</span>
            </div>

            {/* SHARE */}
            <div onClick={handleShare}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12 3v12M12 3l4 4M12 3l-4 4M5 15v4h14v-4" fill="none" stroke="#888" strokeWidth="1.6"/>
              </svg>
            </div>

          </div>

          {/* REPORT */}
          <div onClick={(e) => {
            e.stopPropagation();
            setShowReport(true);
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M5 3v18M5 3h12l-2 4 2 4H5" fill="none" stroke="#ff4d4d" strokeWidth="1.6"/>
            </svg>
          </div>
        </div>

      </div>

      {/* REPORT MODAL */}
      {showReport && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{ width: "320px", background: "#1a1a1a", padding: "18px" }}>
            <h3>Report Post</h3>

            {reasons.map((r) => (
              <label key={r}>
                <input type="radio" onChange={() => setSelectedReason(r)} /> {r}
              </label>
            ))}

            <button onClick={submitReport}>Submit</button>
            <button onClick={() => setShowReport(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}