"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../../lib/pusherClient";
export default function PostPage({
  postId: propPostId,
  mode
}: {
  postId?: string;
  mode?: "post-only" | "comments-only";
})  {
  const params = useParams();
const router = useRouter();

const postId = propPostId || params?.id;
const queryClient = useQueryClient();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
const [replyingTo, setReplyingTo] = useState<{ commentId: string; npId: string } | null>(null);
  const publicId =
    typeof window !== "undefined"
      ? localStorage.getItem("publicId")
      : null;

 useEffect(() => {
  let interval: any = null;

  const startPolling = () => {
    if (interval) return;
    interval = setInterval(loadComments, 30000);
  };

  const stopPolling = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  startPolling();

  const handleVisibility = () => {
    if (document.hidden) {
      stopPolling();
    } else {
      startPolling();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    stopPolling();
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, [postId]);

  async function loadPost() {
    try {
      const token =
  typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

const res = await fetch(`/api/posts?postId=${postId}`, {
  headers: {
    Authorization: token ? `Bearer ${token}` : ""
  }
});
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

    const incoming = Array.isArray(data.comments) ? data.comments : [];

    setComments((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(incoming)) {
        return prev;
      }
      return incoming;
    });

    // 🔥 ADD THIS (VERY IMPORTANT)
    setPost((prev: any) => {
      if (!prev) return prev;

      return {
        ...prev,
        commentsCount: incoming.length
      };
    });

  } catch (error) {
    console.log("Comments load error", error);
    setComments([]);
  }
}
useEffect(() => {
  if (!postId) return;

  loadPost();
  loadComments();
}, [postId]);

useEffect(() => {
  if (!pusherClient) return;

  const channel = pusherClient.subscribe("posts");

  const handler = (data: any) => {
    if (data.postId === postId) {
      setPost((prev: any) => ({
        ...prev,
        likes: data.likeCount,
        isLiked: data.action === "liked"
      }));
    }
  };

  channel.bind("like-update", handler);

 return () => {
  channel.unbind("like-update", handler);

  
};
}, [postId]);
  /* ================= LIKE ================= */
  async function handleLike() {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  // ✅ optimistic (UI feel only)
  const optimistic = !post.isLiked;

 setPost((prev: any) => ({
  ...prev,
  isLiked: optimistic,
  likes: optimistic ? prev.likes + 1 : prev.likes - 1
}));

  try {
    await fetch("/api/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        postId: post.postId
      })
    });

  } catch (err) {
    console.log("Like error", err);
  }
}
  /* ================= SHARE ================= */
  async function handleShare() {
  const url = window.location.href;

  await navigator.clipboard.writeText(url);
  alert("Link copied");
}
  /* ================= REPORT ================= */
  async function handleReport() {
    if (!publicId) {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");

await fetch("/api/report", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : ""
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
  if (!publicId) { router.push("/login"); return; }
  if (!text.trim()) return;

  setLoadingComment(true);

  const tempId = `temp_${Date.now()}`;
  const isReply = !!replyingTo;

  const tempComment: any = {
    commentId: tempId,
    npId: publicId,
    text,
    createdAt: new Date(),
    replies: [],
  };

  if (isReply) {
    // Add optimistic reply under parent
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === replyingTo!.commentId
          ? { ...c, replies: [...(c.replies ?? []), tempComment] }
          : c
      )
    );
  } else {
    setComments((prev) => [tempComment, ...prev]);
  }

  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
      body: JSON.stringify({
        postId,
        text,
        ...(isReply ? { parentId: replyingTo!.commentId } : {}),
      }),
    });

    const data = await res.json();

    if (data.success) {
      setText("");
      setReplyingTo(null);

      if (isReply) {
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === replyingTo!.commentId
              ? {
                  ...c,
                  replies: c.replies.map((r: any) =>
                    r.commentId === tempId ? data.comment : r
                  ),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.commentId === tempId ? data.comment : c))
        );
        setPost((prev: any) => ({
          ...prev,
          commentsCount: data.commentsCount,
        }));
        queryClient.setQueryData(["feed"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: any) =>
                p.postId === postId
                  ? { ...p, commentsCount: data.commentsCount }
                  : p
              ),
            })),
          };
        });
      }
    } else {
      throw new Error();
    }
  } catch {
    if (isReply) {
      setComments((prev) =>
        prev.map((c) =>
          c.commentId === replyingTo?.commentId
            ? { ...c, replies: c.replies.filter((r: any) => r.commentId !== tempId) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.filter((c) => c.commentId !== tempId));
    }
  }

  setLoadingComment(false);
}
const renderContent = (text: string) => {
  return text.split(/(#[\w-]+)/g).map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/search?q=${part.replace("#", "")}`);
          }}
          style={{
            color: "#1e90ff",
            fontWeight: 500,
            cursor: "pointer",
            display: "inline-block",
            padding: "1px 6px",
            borderRadius: "6px",
            background: "rgba(30,144,255,0.1)",
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};
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
const showPost = mode !== "comments-only";
const showComments = mode !== "post-only";
  return (
  <main style={{
  width: "100%",
  padding: "0",
  margin: "0"
}}>

    {/* ================= POST ================= */}
    {showPost && (
<div style={{
  padding: "16px",
}}>
      {/* USER */}
      <div style={{
        fontSize: "12px",
color: "#6f6f6f",
letterSpacing: "0.5px",
        marginBottom: "8px"
      }}>
        {post.npId}
      </div>
      

      {/* CONTENT */}
      <div style={{
  fontSize: "17px",
  color: "#ffffff",
  fontWeight: "500",
  lineHeight: "1.6",
  marginBottom: "12px",

  // ✅ ADD THIS (IMPORTANT)
  userSelect: "none",
  WebkitUserSelect: "none"
}}>
        {renderContent(post.content)}
      </div>

      {/* IMAGE */}
      {post.image && (
        <img
  src={post.image}
  style={{
    width: "100%",
    maxHeight: "60vh",
    objectFit: "cover",
    borderRadius: "16px",
    marginBottom: "12px"
  }}
/>
      )}

      {/* ACTION BAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "6px"
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
            <span style={{ fontSize: "13px" }}>
  {post.commentsCount ?? 0}
</span>
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
    )}
    
   {/* ================= COMMENT INPUT ================= */}
    {showComments && (
      <div style={{ marginTop: "0", padding: "16px 16px 0" }}>

        {/* REPLY BANNER */}
        {replyingTo && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "rgba(30,144,255,0.08)",
            border: "1px solid rgba(30,144,255,0.15)",
            borderRadius: "10px",
            marginBottom: "8px",
          }}>
            <span style={{ fontSize: "13px", color: "#1e90ff" }}>
              ↩ Replying to {replyingTo.npId}
            </span>
            <span
              onClick={() => setReplyingTo(null)}
              style={{ fontSize: "13px", color: "#555", cursor: "pointer", padding: "0 4px" }}
            >
              ✕
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyingTo ? `Reply to ${replyingTo.npId}...` : "Write a comment..."}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "14px",
              background: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              outline: "none",
              fontSize: "14px",
              height: "44px",
            }}
          />
          <button
            onClick={addComment}
            disabled={!text.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: text.trim() ? "#1e90ff" : "#333",
              color: "#fff",
              fontWeight: "500",
              cursor: text.trim() ? "pointer" : "not-allowed",
              transition: "0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {loadingComment ? "..." : replyingTo ? "Reply" : "Post"}
          </button>
        </div>
      </div>
    )}

    {/* ================= COMMENTS ================= */}
    {showComments && (
      <div style={{ marginTop: "12px" }}>
        {comments.length === 0 ? (
          <div style={{ color: "#555", padding: "16px", fontSize: "14px" }}>
            No comments yet
          </div>
        ) : (
          comments.map((c: any) => (
            <div key={c.commentId || String(c._id)}>

              {/* TOP-LEVEL COMMENT */}
              <div style={{
                padding: "12px 16px",
                borderBottom: c.replies?.length === 0
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
              }}>
                <div style={{
                  fontSize: "12px", color: "#555",
                  marginBottom: "4px", fontFamily: "monospace",
                }}>
                  {c.npId}
                </div>
                <div style={{
                  color: "#e5e5e5", fontSize: "15px", lineHeight: "1.6",
                  marginBottom: "6px",
                }}>
                  {c.text}
                </div>
                <div
                  onClick={() => {
                    if (!publicId) { router.push("/login"); return; }
                    setReplyingTo({ commentId: c.commentId, npId: c.npId });
                    setText("");
                  }}
                  style={{
                    fontSize: "12px", color: "#444",
                    cursor: "pointer", display: "inline-flex",
                    alignItems: "center", gap: "4px",
                    userSelect: "none",
                  }}
                >
                  ↩ Reply
                </div>
              </div>

              {/* REPLIES */}
              {c.replies?.length > 0 && (
                <div style={{
                  borderLeft: "2px solid #1a1a1a",
                  marginLeft: "24px",
                  marginBottom: "4px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  {c.replies.map((r: any) => (
                    <div key={r.commentId || String(r._id)} style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}>
                      <div style={{
                        fontSize: "12px", color: "#555",
                        marginBottom: "4px", fontFamily: "monospace",
                      }}>
                        {r.npId}
                      </div>
                      <div style={{
                        color: "#d0d0d0", fontSize: "14px", lineHeight: "1.6",
                      }}>
                        {r.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))
        )}
      </div>
    )}
  </main>
  );
}
    