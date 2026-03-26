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
        setTimeout(() => setAnimateLike(false), 150);
      }
    } catch (err) {
      console.log("LIKE ERROR:", err);
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

  /* ================= CARD CLICK ================= */

  function handleCardClick(e: any) {
    const clickedElement = e.target as HTMLElement;

    // 🚨 BLOCK ACTION BUTTONS
    if (clickedElement.closest("[data-action='true']")) return;

    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.postId })
    });

    router.push(`/post/${post.postId}`);
  }

  /* ================= UI ================= */

  return (
    <>
      <div
        onClick={handleCardClick}
        style={{
          padding: "14px 0",
          borderBottom: "1px solid #1f1f1f",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#121212";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >

        {/* HEADER */}
        <div style={{ fontSize: "13px", color: "#777", marginBottom: "6px" }}>
          <span
            data-action="true"
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
          <div style={{ display: "flex", gap: "22px" }}>

            {/* LIKE */}
            <div
              data-action="true"
              onClick={handleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                color: liked ? "#ff2d55" : "#888"
              }}
            >
              ❤️ {likes}
            </div>

            {/* COMMENT */}
            <div
              data-action="true"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.postId}`);
              }}
              style={{ cursor: "pointer" }}
            >
              💬 {comments}
            </div>

            {/* SHARE */}
            <div
              data-action="true"
              onClick={handleShare}
              style={{ cursor: "pointer" }}
            >
              🔗
            </div>
          </div>

          {/* REPORT */}
          <div
            data-action="true"
            onClick={(e) => {
              e.stopPropagation();
              setShowReport(true);
            }}
            style={{ cursor: "pointer" }}
          >
            🚩
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
            <h3>Report Post</h3>

            {reasons.map((r) => (
              <label key={r} style={{ display: "block" }}>
                <input
                  type="radio"
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