"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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

  const publicId =
    typeof window !== "undefined"
      ? localStorage.getItem("publicId")
      : null;

  useEffect(() => {
  if (!postId) return;

  loadPost();
  loadComments();

  let interval: any;

  const startPolling = () => {
  if (interval) clearInterval(interval); // ✅ ADD THIS LINE

  interval = setInterval(() => {
    loadPost();
    loadComments();
  }, 5000);
};

  const stopPolling = () => {
    if (interval) clearInterval(interval);
  };
const handleVisibility = () => {
  if (document.hidden) {
    stopPolling();
  } else {
    startPolling();
  }
};
  // ✅ start when active
  startPolling();
document.addEventListener("visibilitychange", handleVisibility);
  // ✅ stop when tab inactive
  
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
      setComments(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.log("Comments load error", error);
      setComments([]);
    }
  }

  /* ================= LIKE ================= */
  async function handleLike() {
    const token = localStorage.getItem("token");
if (!token) {
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
      const token = localStorage.getItem("token");

const res = await fetch("/api/like", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : ""
  },
  body: JSON.stringify({
    postId: post.postId
  })
});

      const data = await res.json();

      if (data.success) {
  const isLikedNow = data.action === "liked";

  setPost((prev: any) => ({
    ...prev,
    isLiked: isLikedNow,
    likes: data.likeCount
  }));

  // 🔥 SYNC HOME FEED (ONLY ADDITION)
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
// 🔥 ADD THIS BLOCK (SYNC POST PAGE)
queryClient.setQueryData(["post", post.postId], (old: any) => {
  if (!old) return old;

  return {
    ...old,
    post: {
      ...old.post,
      likes: data.likeCount,
      isLiked: isLikedNow
    }
  };
});
  
}
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
      alert("Login first");
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
  if (!publicId) return alert("Login first");
  if (!text.trim()) return;

  setLoadingComment(true);

  const tempId = Date.now();

  const tempComment = {
    _id: tempId,
    npId: publicId,
    text,
    createdAt: new Date()
  };

  // ✅ 1. INSTANT UI
  setComments((prev) => [tempComment, ...prev]);

  try {
    const res = await fetch("/api/comments", {
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

    const data = await res.json();
if (data.success) {
  setText("");

  // ✅ Replace temp comment with real one
  setComments((prev) =>
    prev.map((c) =>
      c._id === tempId ? data.comment : c
    )
  );

  // ✅ Update post count
  setPost((prev: any) => ({
    ...prev,
    commentsCount: data.commentsCount
  }));

  // ✅ Sync FEED
  queryClient.setQueryData(["feed"], (old: any) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        posts: page.posts.map((p: any) =>
          p.postId === postId
            ? {
                ...p,
                commentsCount: data.commentsCount
              }
            : p
        )
      }))
    };
  });

  // ✅ Sync POST PAGE
  queryClient.setQueryData(["post", postId], (old: any) => {
    if (!old) return old;

    return {
      ...old,
      post: {
        ...old.post,
        commentsCount: data.commentsCount
      }
    };
  });
}
     else {
      throw new Error();
    }

  } catch (err) {
    // ❌ REMOVE TEMP COMMENT IF FAILED
    setComments((prev) => prev.filter((c) => c._id !== tempId));
  }

  setLoadingComment(false);
}
const renderContent = (text: string) => {
  const parts = text.split(/(#\w+)/g);

  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
       <span
  key={i}
  onClick={() => router.push(`/search?q=${part.replace("#", "")}`)}
  style={{
    color: "#4da6ff",
    cursor: "pointer",

    // ✅ UX IMPROVEMENTS
    fontWeight: "500",
    transition: "0.2s",
    padding: "2px 4px",
    borderRadius: "6px"
  }}

  onTouchStart={(e) => {
    (e.target as HTMLElement).style.background = "rgba(77,166,255,0.15)";
  }}

  onTouchEnd={(e) => {
    (e.target as HTMLElement).style.background = "transparent";
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
  {post.commentsCount || comments.length}
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
<div style={{
      marginTop: "12px",
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
         background: "#0f0f10",
border: "1px solid rgba(255,255,255,0.08)",
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
    )}
    {/* ================= COMMENTS ================= */}
    {showComments && (
<div style={{
  marginTop: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "6px"
}}>
      {comments.length === 0 ? (
        <div style={{ color: "#666" }}>
          No comments yet
        </div>
      ) : (
        comments.map((c) => (
          <div key={c._id} style={{
  padding: "10px 0"
}}>
            <div style={{
  fontSize: "11px",
  color: "#6f6f6f",
  marginBottom: "4px"
}}>
              {c.npId}
            </div>

            <div style={{
  color: "#f1f1f1",
  fontSize: "14px",
  lineHeight: "1.5"
}}>
              {c.text}
            </div>
          </div>
        
        ))
      )}
    </div>
    )} 
  </main>
    
);
}