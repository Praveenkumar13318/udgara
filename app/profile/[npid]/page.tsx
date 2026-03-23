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

  useEffect(() => {
    if (!npId) return;
    loadData();
  }, [npId]);

  async function loadData() {

    try {

      const res = await fetch(`/api/profile?npId=${npId}`);
      const data = await res.json();

      const profile = data?.data || {};

      setPosts(Array.isArray(profile.posts) ? profile.posts : []);
      setComments(Array.isArray(profile.comments) ? profile.comments : []);

    } catch (err) {
      console.log("Profile load error", err);
    }

    setLoading(false);

  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        Loading profile...
      </div>
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