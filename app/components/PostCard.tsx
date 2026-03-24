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
  const [loadingLike, setLoadingLike] = useState(false);

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

    if (loadingLike) return;
    setLoadingLike(true);

    const el = e.currentTarget;
    const publicId = localStorage.getItem("publicId");

    if (!publicId) {
      router.push("/login");
      return;
    }

    const prevLiked = liked;
    const prevLikes = likes;

    // optimistic UI
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

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
      setLiked(prevLiked);
      setLikes(prevLikes);
    }

    setLoadingLike(false);

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
      onClick={(e) => {
        const target = e.target as HTMLElement;

        if (target.closest("[data-action]")) return;

        fetch("/api/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.postId })
        });

        router.push(`/post/${post.postId}`);
      }}
      style={{
        padding: "14px 0",
        borderBottom: "1px solid #1f1f1f",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#121212";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* HEADER */}
      <div style={{ fontSize: "13px", color: "#777", marginBottom: "6px" }}>
        <span
          data-action
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
        style={{
          fontSize: "15px",
          lineHeight: "1.6",
          color: "#eaeaea",
          marginBottom: "10px",
          wordBreak: "break-word"
        }}
      >
        {post.content}
      </div>

      {/* IMAGE */}
      {post.image && (
        <div
          style={{
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "10px",
            background: imageLoaded ? "transparent" : "#1f1f1f"
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px"
          }}
        >
          {/* LIKE */}
          <div
            data-action
            onClick={(e) => {
              e.stopPropagation();
              handleLike(e);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: liked ? "#ff2d55" : "#888",
              minWidth: "50px"
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{
                transform: animateLike ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.12s ease"
              }}
            >
              <path
                d="M16.697 5.5c-1.222 0-2.404.724-2.997 1.86-.593-1.136-1.775-1.86-2.997-1.86-1.93 0-3.5 1.57-3.5 3.5 0 4.25 6.497 8.5 6.497 8.5s6.497-4.25 6.497-8.5c0-1.93-1.57-3.5-3.5-3.5z"
                fill={liked ? "#ff2d55" : "none"}
                stroke={liked ? "#ff2d55" : "#888"}
                strokeWidth="1.6"
              />
            </svg>

            <span style={{ fontSize: "13px" }}>{likes}</span>
          </div>

          {/* COMMENT */}
          <div
            data-action
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/post/${post.postId}`);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              minWidth: "50px"
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

            <span style={{ fontSize: "13px" }}>{comments}</span>
          </div>

          {/* SHARE */}
          <div
            data-action
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              minWidth: "40px"
            }}
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

        {/* REPORT */}
        <div
          data-action
          onClick={(e) => {
            e.stopPropagation();
            setShowReport(true);
          }}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
          }}
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

    {/* REPORT MODAL */}
    {showReport && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
      >
        <div
          style={{
            width: "320px",
            background: "#1a1a1a",
            borderRadius: "12px",
            padding: "18px",
            border: "1px solid #2a2a2a"
          }}
        >
          <h3 style={{ marginBottom: "14px" }}>Report Post</h3>

          {reasons.map((r) => (
            <label key={r} style={{ display: "block", marginBottom: "6px" }}>
              <input
                type="radio"
                name="reason"
                value={r}
                onChange={() => setSelectedReason(r)}
              />{" "}
              {r}
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