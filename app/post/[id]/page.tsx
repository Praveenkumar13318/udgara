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
      setComments(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.log("Comments load error", error);
      setComments([]);
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

  /* LOADING */

  if (loadingPost) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        Post not found
      </div>
    );
  }

  return (

    <main style={{
      maxWidth: "700px",
      margin: "0 auto",
      padding: "20px"
    }}>

      {/* POST CARD */}

      <div style={{
        background: "#111",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "20px",
        border: "1px solid #222",
        boxShadow: "0 0 12px rgba(0,0,0,0.5)"
      }}>

        {/* HEADER */}
        <div style={{
          color: "#888",
          fontSize: "13px",
          marginBottom: "8px"
        }}>
          {post.npId?.toUpperCase()} • {new Date(post.createdAt).toLocaleDateString()}
        </div>

        {/* CONTENT */}
        <div style={{
          fontSize: "18px",
          lineHeight: "1.6",
          color: "#fff",
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
              marginBottom: "12px",
              maxHeight: "420px",
              objectFit: "cover"
            }}
          />
        )}

        {/* ACTION BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid #222",
          color: "#aaa",
          fontSize: "14px"
        }}>
          <span>❤️ {post.likes || 0}</span>
          <span>💬 {comments.length}</span>
          <span>🔁 Share</span>
          <span>🚩 Report</span>
        </div>

      </div>

      {/* COMMENT INPUT */}

      <div style={{ marginBottom: "20px" }}>

        <div style={{
          display: "flex",
          gap: "10px",
          alignItems: "center"
        }}>

          <textarea
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#111",
              color: "white",
              resize: "none",
              minHeight: "40px"
            }}
          />

          <button
            onClick={addComment}
            disabled={loadingComment}
            style={{
              padding: "10px 16px",
              background: loadingComment ? "#444" : "#ff4747",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loadingComment ? "..." : "Post"}
          </button>

        </div>

      </div>

      {/* COMMENTS */}

      {comments.length === 0 ? (
        <div style={{ color: "#777" }}>
          No comments yet. Start the discussion.
        </div>
      ) : (

        comments.map((c) => (

          <div
            key={c._id}
            style={{
              background: "#111",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "10px",
              border: "1px solid #222"
            }}
          >

            <div style={{
              color: "#888",
              fontSize: "12px",
              marginBottom: "4px"
            }}>
              {c.npId?.toUpperCase()}
            </div>

            <div style={{
              color: "#fff",
              fontSize: "14px"
            }}>
              {c.text}
            </div>

          </div>

        ))

      )}

    </main>

  );
}