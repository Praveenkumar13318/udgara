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

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!postId) return;
    loadPost();
    loadComments();
  }, [postId]);

  async function loadPost() {
    try {
      const publicId = localStorage.getItem("publicId");

      const res = await fetch(`/api/posts?postId=${postId}&publicId=${publicId || ""}`);
      const data = await res.json();

      setPost(data.post);

      setLiked(data.post?.isLiked || false);
      setLikesCount(data.post?.likes || 0);

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

  /* =========================
     LIKE SYSTEM (PRODUCTION)
  ========================= */

  async function handleLike() {
    const publicId = localStorage.getItem("publicId");

    if (!publicId) {
      alert("Login first");
      return;
    }

    // optimistic UI
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          postId,
          npId: publicId
        })
      });

      const data = await res.json();

      // sync with backend
      setLiked(data.liked);
      setLikesCount(data.likes);

    } catch (error) {
      console.log("Like error", error);

      // rollback
      setLiked(prev => !prev);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    }
  }

  /* =========================
     COMMENT
  ========================= */

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

  /* ========================= */

  if (loadingPost) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  if (!post) {
    return <div style={{ padding: 40, textAlign: "center" }}>Post not found</div>;
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>

      {/* POST CARD */}
      <div style={{
        background: "#111",
        padding: 20,
        borderRadius: 16,
        border: "1px solid #222"
      }}>

        <div style={{ color: "#888", fontSize: 13 }}>
          {post.npId} • {new Date(post.createdAt).toLocaleDateString()}
        </div>

        <div style={{ marginTop: 8, fontSize: 18 }}>
          {post.content}
        </div>

        {post.image && (
          <img src={post.image} style={{
            width: "100%",
            borderRadius: 12,
            marginTop: 12
          }} />
        )}

        {/* ACTION BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 15,
          paddingTop: 10,
          borderTop: "1px solid #222"
        }}>

          {/* LIKE */}
          <div onClick={handleLike} style={{ cursor: "pointer" }}>
            ❤️ {likesCount}
          </div>

          {/* COMMENT */}
          <div>
            💬 {comments.length}
          </div>

          {/* SHARE */}
          <div onClick={() => {
            navigator.share?.({
              title: "Udgara Post",
              text: post.content
            });
          }}>
            🔁
          </div>

          {/* REPORT */}
          <div onClick={() => alert("Report coming soon")}>
            🚩
          </div>

        </div>

      </div>

      {/* COMMENT INPUT */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write comment..."
          style={{
            flex: 1,
            padding: 10,
            background: "#111",
            border: "1px solid #333",
            borderRadius: 10,
            color: "white"
          }}
        />

        <button onClick={addComment} style={{
          background: "#ff4747",
          border: "none",
          padding: "10px 16px",
          borderRadius: 10,
          color: "white"
        }}>
          Post
        </button>
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: 20 }}>
        {comments.map((c) => (
          <div key={c._id} style={{
            background: "#111",
            padding: 12,
            borderRadius: 10,
            marginBottom: 10,
            border: "1px solid #222"
          }}>
            <div style={{ color: "#888", fontSize: 12 }}>
              {c.npId}
            </div>
            <div>{c.text}</div>
          </div>
        ))}
      </div>

    </main>
  );
}