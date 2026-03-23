"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PostPage() {

  const params = useParams();
  const postId = params?.id;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {

    if (!postId) return;

    loadPost();
    loadComments();

  }, [postId]);

  async function loadPost() {

    try {

      const res = await fetch(`/api/posts?postId=${postId}`);
      const data = await res.json();

      setPost(data.post);

    } catch (error) {
      console.log("Post load error", error);
    }

    setLoadingPost(false);

  }

  async function loadComments() {

    try {

      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();

      // ✅ FIXED (IMPORTANT)
      setComments(Array.isArray(data.data) ? data.data : []);

    } catch (error) {
      console.log("Comments load error", error);
      setComments([]); // safety
    }

  }

  async function addComment() {

    const publicId = localStorage.getItem("publicId");

    if (!publicId) {
      alert("Login first");
      return;
    }

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

  /* 🔄 LOADING STATE */

  if (loadingPost) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        Loading post...
      </div>
    );
  }

  /* ❌ NOT FOUND */

  if (!post) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        Post not found
      </div>
    );
  }

  return (

    <main style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>

      {/* POST */}

      <div
        style={{
          background: "#1a1a1a",
          padding: "24px",
          borderRadius: "14px",
          marginBottom: "30px",
          border: "1px solid #2c2c2c"
        }}
      >

        <div style={{ color: "#8a8a8a", fontSize: "13px", marginBottom: 6 }}>
          {post.npId?.toUpperCase()}
        </div>

        <div style={{ fontSize: "18px", lineHeight: "1.6" }}>
          {post.content}
        </div>

        {post.image && (
          <img
            src={post.image}
            style={{
              width: "100%",
              marginTop: "16px",
              borderRadius: "10px",
              maxHeight: "420px",
              objectFit: "cover"
            }}
          />
        )}

      </div>

      {/* COMMENT BOX */}

      <div style={{ marginBottom: "30px" }}>

        <textarea
          placeholder="Join the discussion..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#111",
            color: "white",
            marginBottom: "10px",
            resize: "none"
          }}
        />

        <button
          onClick={addComment}
          disabled={loadingComment}
          style={{
            padding: "10px 20px",
            background: loadingComment ? "#444" : "#ff4747",
            border: "none",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loadingComment ? "Posting..." : "Comment"}
        </button>

      </div>

      {/* COMMENTS */}

      {!Array.isArray(comments) || comments.length === 0 ? (
        <div style={{ color: "#777" }}>
          No comments yet. Start the discussion.
        </div>
      ) : (

        comments.map((c) => (

          <div
            key={c._id}
            style={{
              background: "#161616",
              padding: "16px",
              borderRadius: "10px",
              marginBottom: "12px",
              border: "1px solid #262626"
            }}
          >

            <div style={{ color: "#9a9a9a", fontSize: "13px" }}>
              {c.npId?.toUpperCase()}
            </div>

            <div style={{ marginTop: "6px" }}>
              {c.text}
            </div>

          </div>

        ))

      )}

    </main>

  );

}