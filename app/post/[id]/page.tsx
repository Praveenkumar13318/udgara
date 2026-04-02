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
    return <div style={{ padding: 40, color: "#aaa" }}>Loading...</div>;
  }

  if (!post) {
    return <div style={{ padding: 40 }}>Post not found</div>;
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>

      {/* POST */}
      <div style={{
        background: "#1a1a1a",
        padding: 20,
        borderRadius: 14,
        border: "1px solid #2c2c2c"
      }}>
        <div style={{ color: "#888", fontSize: 13, marginBottom: 6 }}>
          {post.npId}
        </div>

        <div style={{ fontSize: 18 }}>{post.content}</div>

        {post.image && (
          <img src={post.image} style={{
            width: "100%",
            marginTop: 12,
            borderRadius: 10
          }} />
        )}

        {/* ACTION BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 14
        }}>
          <div style={{ display: "flex", gap: 20 }}>

            {/* LIKE */}
            <div onClick={handleLike} style={{ display: "flex", gap: 6 }}>
              <svg width="20" height="20">
                <path
                  d="M16.697 5.5c-1.222 0-2.404.724-2.997 1.86-.593-1.136-1.775-1.86-2.997-1.86-1.93 0-3.5 1.57-3.5 3.5 0 4.25 6.497 8.5 6.497 8.5s6.497-4.25 6.497-8.5c0-1.93-1.57-3.5-3.5-3.5z"
                  fill={post.isLiked ? "#ff2d55" : "none"}
                  stroke="#ff2d55"
                  strokeWidth="1.6"
                />
              </svg>
              {post.likes}
            </div>

            {/* COMMENT */}
            <div style={{ display: "flex", gap: 6 }}>
              <svg width="20" height="20">
                <path d="M4 4h16v12H8l-4 4V4z"
                  fill="none" stroke="#888" strokeWidth="1.6" />
              </svg>
              {comments.length}
            </div>

            {/* SHARE */}
            <div onClick={handleShare}>
              <svg width="20" height="20">
                <path d="M12 3v12M12 3l4 4M12 3l-4 4M5 15v4h14v-4"
                  fill="none" stroke="#888" strokeWidth="1.6" />
              </svg>
            </div>

          </div>

          {/* REPORT */}
          <div onClick={handleReport}>
            <svg width="20" height="20">
              <path d="M5 3v18M5 3h12l-2 4 2 4H5"
                fill="none" stroke="#ff4d4d" strokeWidth="1.6" />
            </svg>
          </div>
        </div>

      </div>

      {/* COMMENT BOX */}
      <div style={{ marginTop: 20 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            padding: 10,
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 8
          }}
        />

        <button onClick={addComment} style={{
          marginTop: 10,
          padding: "10px 16px",
          background: "#ff4d4d",
          border: "none",
          borderRadius: 6,
          color: "#fff"
        }}>
          {loadingComment ? "Posting..." : "Post"}
        </button>
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: 20 }}>
        {comments.map((c) => (
          <div key={c._id} style={{
            padding: 12,
            background: "#161616",
            borderRadius: 10,
            marginBottom: 10
          }}>
            <div style={{ color: "#aaa", fontSize: 12 }}>
              {c.npId}
            </div>
            <div>{c.text}</div>
          </div>
        ))}
      </div>

    </main>
  );
}