"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);

  const publicId =
    typeof window !== "undefined"
      ? localStorage.getItem("publicId")
      : null;

  useEffect(() => {
    if (!postId) return;
    loadPost();
    loadComments();
  }, [postId]);

  async function loadPost() {
    try {
      const res = await fetch(`/api/posts?postId=${postId}&publicId=${publicId}`);
      const data = await res.json();

      setPost({
        ...data.post,
        likes: data.post?.likes || 0,
        isLiked: data.post?.isLiked || false
      });
    } catch (error) {
      console.log("Post load error", error);
    }
    setLoadingPost(false);
  }

  async function loadComments() {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();
      setComments(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.log("Comments load error", error);
      setComments([]);
    }
  }

  /* ================= LIKE ================= */
  async function handleLike() {
    if (!publicId) {
      alert("Login first");
      return;
    }

    const optimistic = !post.isLiked;

    setPost((prev: any) => ({
      ...prev,
      isLiked: optimistic,
      likes: optimistic ? prev.likes + 1 : prev.likes - 1
    }));

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          postId: post.postId,
          publicId
        })
      });

      const data = await res.json();

      if (data.success) {
        setPost((prev: any) => ({
          ...prev,
          isLiked: data.action === "liked",
          likes: data.likeCount
        }));
      }
    } catch (err) {
      console.log("Like error", err);
    }
  }

  /* ================= SHARE ================= */
  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Udgara", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  }

  /* ================= REPORT ================= */
  async function handleReport() {
    if (!publicId) {
      alert("Login first");
      return;
    }

    await fetch("/api/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postId: post.postId,
        npId: publicId
      })
    });

    alert("Reported");
  }

  /* ================= COMMENT ================= */
  async function addComment() {
    if (!publicId) return alert("Login first");
    if (!text.trim()) return;

    setLoadingComment(true);

    await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postId,
        npId: publicId,
        text
      })
    });

    setText("");
    await loadComments();
    setLoadingComment(false);
  }

 if (loadingPost) {
  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "16px"
      }}
    >

      {/* USER */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ width: "100px", height: "10px", background: "#222", marginBottom: "8px" }} />
      </div>

      {/* CONTENT */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ height: "12px", background: "#222", marginBottom: "8px" }} />
        <div style={{ height: "12px", background: "#222", width: "90%", marginBottom: "8px" }} />
        <div style={{ height: "12px", background: "#222", width: "70%" }} />
      </div>

      {/* IMAGE */}
      <div
        style={{
          width: "100%",
          height: "200px",
          background: "#1a1a1a",
          borderRadius: "12px",
          marginBottom: "16px"
        }}
      />

      {/* ACTION BAR */}
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ width: "40px", height: "12px", background: "#222" }} />
        <div style={{ width: "40px", height: "12px", background: "#222" }} />
      </div>

    </main>
  );
}

  if (!post) {
    return <div style={{ padding: 40 }}>Post not found</div>;
  }

  return (
  <main style={{
    maxWidth: "700px",
    margin: "0 auto",
    padding: "16px"
  }}>

    {/* ================= POST ================= */}
    <div style={{
      background: "linear-gradient(180deg,#1a1a1a,#141414)",
      padding: "18px",
      borderRadius: "16px",
      border: "1px solid #262626",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
    }}>

      {/* USER */}
      <div style={{
        fontSize: "13px",
        color: "#8a8a8a",
        marginBottom: "8px"
      }}>
        {post.npId}
      </div>

      {/* CONTENT */}
      <div style={{
        fontSize: "18px",
        color: "#f1f1f1",
        lineHeight: "1.6",
        marginBottom: "12px"
      }}>
        {post.content}
      </div>

      {/* IMAGE */}
      {post.image && (
        <img
          src={post.image}
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "14px"
          }}
        />
      )}

      {/* ACTION BAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #222",
        paddingTop: "10px"
      }}>

        <div style={{
          display: "flex",
          gap: "24px",
          alignItems: "center"
        }}>

          {/* LIKE */}
          <div
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M16.697 5.5c-1.222 0-2.404.724-2.997 1.86-.593-1.136-1.775-1.86-2.997-1.86-1.93 0-3.5 1.57-3.5 3.5 0 4.25 6.497 8.5 6.497 8.5s6.497-4.25 6.497-8.5c0-1.93-1.57-3.5-3.5-3.5z"
                fill={post.isLiked ? "#ff2d55" : "none"}
                stroke={post.isLiked ? "#ff2d55" : "#888"}
                strokeWidth="1.6"
              />
            </svg>
            <span style={{ fontSize: "13px" }}>{post.likes}</span>
          </div>

          {/* COMMENT */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M4 4h16v12H8l-4 4V4z"
                fill="none"
                stroke="#888"
                strokeWidth="1.6"
              />
            </svg>
            <span style={{ fontSize: "13px" }}>{comments.length}</span>
          </div>

          {/* SHARE */}
          <div onClick={handleShare} style={{ cursor: "pointer" }}>
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
        <div onClick={handleReport} style={{ cursor: "pointer" }}>
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

    {/* ================= COMMENT INPUT ================= */}
    <div style={{
      marginTop: "18px",
      display: "flex",
      gap: "10px"
    }}>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #2a2a2a",
          background: "#111",
          color: "#fff",
          outline: "none"
        }}
      />

      <button
        onClick={addComment}
        disabled={loadingComment}
        style={{
          padding: "10px 16px",
          borderRadius: "12px",
          border: "none",
          background: loadingComment ? "#444" : "#ff4d4d",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        {loadingComment ? "..." : "Post"}
      </button>

    </div>

    {/* ================= COMMENTS ================= */}
    <div style={{ marginTop: "18px" }}>
      {comments.length === 0 ? (
        <div style={{ color: "#666" }}>
          No comments yet
        </div>
      ) : (
        comments.map((c) => (
          <div key={c._id} style={{
            background: "#161616",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "10px",
            border: "1px solid #262626"
          }}>
            <div style={{
              fontSize: "12px",
              color: "#888",
              marginBottom: "4px"
            }}>
              {c.npId}
            </div>

            <div style={{ color: "#eaeaea" }}>
              {c.text}
            </div>
          </div>
        ))
      )}
    </div>

  </main>
);
}