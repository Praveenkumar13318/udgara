"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostCard from "../../components/PostCard";

export default function ProfilePage() {

  const params = useParams();

  const npId =
    typeof params?.npid === "string"
      ? params.npid
      : Array.isArray(params?.npid)
      ? params.npid[0]
      : "";

  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);
  useEffect(() => {
  if (!npId) return;

  setLoading(true); // 🔥 important

  loadData();
}, [npId]);

  async function loadData() {

    try {

  const res = await fetch(`/api/profile?npId=${npId}`);

  if (!res.ok) throw new Error("API failed");

  const data = await res.json();

  const profile = data?.data || {};

  setPosts(Array.isArray(profile.posts) ? profile.posts : []);
  setComments(Array.isArray(profile.comments) ? profile.comments : []);

} catch (err) {
  console.log("Profile load error", err);
  setError(true); // 🔥 IMPORTANT
}

    setLoading(false);

  }
  if (error) {
  return (
    <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
      Failed to load profile
    </div>
  );
}

  if (loading) {
  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "20px"
      }}
    >

      {/* HEADER SKELETON */}
      <div
        style={{
          background: "#111",
          padding: "28px",
          borderRadius: "18px",
          marginBottom: "30px"
        }}
      >
        <div style={{ width: "120px", height: "18px", background: "#222", borderRadius: "6px" }} />

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div style={{ width: "40px", height: "20px", background: "#222", borderRadius: "6px" }} />
          <div style={{ width: "40px", height: "20px", background: "#222", borderRadius: "6px" }} />
          <div style={{ width: "40px", height: "20px", background: "#222", borderRadius: "6px" }} />
        </div>
      </div>

      {/* POSTS SKELETON */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "16px",
            background: "#111",
            borderRadius: "12px",
            marginBottom: "12px"
          }}
        >
          <div style={{ width: "30%", height: "10px", background: "#222", marginBottom: "10px" }} />
          <div style={{ width: "80%", height: "12px", background: "#222" }} />
        </div>
      ))}

    </main>
  );
}

  const totalLikes = posts.reduce(
    (acc, p) => acc + (p.likes || 0),
    0
  );

  return (

    <main
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "20px",
        color: "white"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background: "linear-gradient(135deg,#111,#1c1c1c)",
          padding: "28px",
          borderRadius: "18px",
          marginBottom: "30px",
          border: "1px solid #2a2a2a",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }}
      >

        <div style={{ fontSize: "22px", fontWeight: 700 }}>
          {npId}
        </div>

        <div
          style={{
            marginTop: "14px",
            display: "flex",
            justifyContent: "space-between",
            textAlign: "center"
          }}
        >

          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {posts.length}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Posts
            </div>
          </div>

          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {comments.length}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Comments
            </div>
          </div>

          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {totalLikes}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Reactions
            </div>
          </div>

        </div>

      </div>

      {/* POSTS */}

      <h3 style={{ marginBottom: "12px" }}>Posts</h3>

      {posts.length === 0 && (
        <div style={{ color: "#777", marginBottom: "20px" }}>
          Nothing here yet — start posting 🚀
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}

      {/* COMMENTS */}

      <h3 style={{ marginTop: "30px", marginBottom: "12px" }}>
        Comments
      </h3>

      {comments.length === 0 && (
        <div style={{ color: "#777" }}>
          No comments yet
        </div>
      )}

      {comments.map((c: any) => (

        <div
          key={c._id}
          style={{
            background: "#1a1a1a",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "10px",
            border: "1px solid #2a2a2a"
          }}
        >

          <div style={{ fontSize: "13px", color: "#aaa" }}>
            {c.npId}
          </div>

          <div style={{ fontSize: "14px" }}>
            {c.text}
          </div>

        </div>

      ))}

    </main>

  );

}