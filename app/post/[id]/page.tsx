"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostCard from "../../components/PostCard";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

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
    setLoading(true);
    loadData();
  }, [npId]);

  async function loadData() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/profile?npId=${npId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      const profile = data?.data || {};
      setPosts(Array.isArray(profile.posts) ? profile.posts : []);
      setComments(Array.isArray(profile.comments) ? profile.comments : []);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
        Failed to load profile
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px" }}>
        <div style={{ background: "#111", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ width: "120px", height: "16px", background: "#1a1a1a", borderRadius: "6px", marginBottom: "16px" }} />
          <div style={{ display: "flex", gap: "32px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div style={{ width: "32px", height: "20px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "4px" }} />
                <div style={{ width: "48px", height: "10px", background: "#1a1a1a", borderRadius: "4px" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", color: "white" }}>

      {/* PROFILE HEADER */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          background: "#111",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "0",
          borderLeft: "3px solid #1e90ff",
        }}>
          <div style={{
            fontSize: "11px", color: "#555",
            letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px",
          }}>
            Anonymous ID
          </div>
          <div style={{
            fontSize: "22px", fontWeight: 700, color: "#fff",
            letterSpacing: "1px", marginBottom: "16px", fontFamily: "monospace",
            userSelect: "none", WebkitUserSelect: "none" as any,
          }}>
            {npId.toUpperCase()}
          </div>

          <div style={{
            display: "flex", gap: "0",
            borderTop: "1px solid #1a1a1a", paddingTop: "16px",
            userSelect: "none", WebkitUserSelect: "none" as any,
          }}>
            {[
              { label: "Posts", value: posts.length },
              { label: "Comments", value: comments.length },
              { label: "Reactions", value: totalLikes },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                flex: 1, textAlign: "center",
                borderRight: i < 2 ? "1px solid #1a1a1a" : "none",
                padding: "0 8px",
              }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display: "flex",
          marginTop: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            { key: "posts", label: "Posts" },
            { key: "comments", label: "Comments" },
          ].map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1, textAlign: "center", padding: "12px 0",
                fontSize: "14px", fontWeight: 600,
                color: activeTab === tab.key ? "#fff" : "#555",
                borderBottom: activeTab === tab.key ? "2px solid #1e90ff" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s",
                userSelect: "none", WebkitUserSelect: "none" as any,
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* POSTS TAB */}
      {activeTab === "posts" && (
        <>
          {posts.length === 0 && (
            <div style={{ color: "#444", padding: "40px 16px", textAlign: "center", fontSize: "14px" }}>
              No posts yet
            </div>
          )}
          {posts.map((post) => (
            <PostCard key={post.postId} post={post} setReportOpen={setReportOpen} />
          ))}
        </>
      )}

      {/* COMMENTS TAB */}
      {activeTab === "comments" && (
        <div>
          {comments.length === 0 && (
            <div style={{ color: "#444", padding: "40px 16px", textAlign: "center", fontSize: "14px" }}>
              No comments yet
            </div>
          )}
          {comments.map((c: any) => (
            <div
              key={c.commentId || String(c._id)}
              style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div style={{ fontSize: "14px", color: "#e5e5e5", lineHeight: 1.5 }}>{c.text}</div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}>
                on post · {c.postId?.slice(-6)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: "32px" }} />
    </div>
  );
}
