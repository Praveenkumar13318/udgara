"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  postId: string;
  npId: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  reports: number;
  createdAt: string;
};

type Report = {
  postId: string;
  reportCount: number;
  reasons: string[];
  post: Post | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"reports" | "posts">("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }

    try {
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.replace("/"); return; }
      setAuthorized(true);
      loadReports();
    } catch {
      router.replace("/");
    }
  }

  async function loadReports() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/reports", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function loadPosts() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/posts", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function deletePost(postId: string) {
    if (!confirm("Delete this post permanently?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/delete-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      tab === "reports" ? loadReports() : loadPosts();
    } else {
      alert("Delete failed");
    }
  }

  async function resolveReport(postId: string) {
    const token = localStorage.getItem("token");
    await fetch("/api/admin/resolve-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify({ postId }),
    });
    loadReports();
  }

  if (!authorized) return null;

  const tabStyle = (t: string) => ({
    flex: 1, textAlign: "center" as const, padding: "12px",
    fontSize: "13px", fontWeight: 600,
    color: tab === t ? "#fff" : "#444",
    borderBottom: tab === t ? "2px solid #1e90ff" : "2px solid transparent",
    cursor: "pointer",
    userSelect: "none" as const,
  });

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "16px", color: "white" }}>
      <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
        Admin Dashboard
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", marginBottom: "16px" }}>
        <div style={tabStyle("reports")} onClick={() => { setTab("reports"); loadReports(); }}>
          Reported Posts
        </div>
        <div style={tabStyle("posts")} onClick={() => { setTab("posts"); loadPosts(); }}>
          All Posts
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "#444", padding: "40px" }}>Loading...</div>
      )}

      {/* REPORTED POSTS TAB */}
      {!loading && tab === "reports" && (
        <>
          {reports.length === 0 && (
            <div style={{ color: "#444", textAlign: "center", padding: "40px" }}>No reports</div>
          )}
          {reports.map((r) => (
            <div key={r.postId} style={{
              background: "#111", borderRadius: "12px", padding: "16px",
              marginBottom: "12px", border: "1px solid #1f1f1f",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#555", fontFamily: "monospace" }}>
                  {r.postId}
                </span>
                <span style={{
                  background: "rgba(255,77,77,0.1)", color: "#ff4d4d",
                  fontSize: "12px", padding: "2px 8px", borderRadius: "99px",
                }}>
                  {r.reportCount} reports
                </span>
              </div>

              {r.post && (
                <>
                  <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>
                    {r.post.npId}
                  </div>
                  <div style={{ fontSize: "15px", color: "#e5e5e5", marginBottom: "10px", lineHeight: 1.5 }}>
                    {r.post.content}
                  </div>
                  {r.post.image && (
                    <img src={r.post.image} style={{
                      width: "100%", maxHeight: "200px", objectFit: "cover",
                      borderRadius: "8px", marginBottom: "10px",
                    }} />
                  )}
                </>
              )}

              <div style={{ fontSize: "12px", color: "#555", marginBottom: "12px" }}>
                Reasons: {[...new Set(r.reasons)].join(", ")}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => resolveReport(r.postId)}
                  style={{
                    padding: "8px 16px", borderRadius: "8px",
                    border: "1px solid #2a2a2a", background: "transparent",
                    color: "#888", fontSize: "13px", cursor: "pointer",
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => deletePost(r.postId)}
                  style={{
                    padding: "8px 16px", borderRadius: "8px",
                    border: "none", background: "#ff4d4d",
                    color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 600,
                  }}
                >
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ALL POSTS TAB */}
      {!loading && tab === "posts" && (
        <>
          {posts.map((post) => (
            <div key={post.postId} style={{
              background: "#111", borderRadius: "12px", padding: "16px",
              marginBottom: "12px", border: "1px solid #1f1f1f",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#888", fontFamily: "monospace" }}>
                  {post.npId}
                </span>
                {post.reports > 0 && (
                  <span style={{
                    background: "rgba(255,77,77,0.1)", color: "#ff4d4d",
                    fontSize: "12px", padding: "2px 8px", borderRadius: "99px",
                  }}>
                    {post.reports} reports
                  </span>
                )}
              </div>
              <div style={{ fontSize: "15px", color: "#e5e5e5", marginBottom: "10px", lineHeight: 1.5 }}>
                {post.content}
              </div>
              {post.image && (
                <img src={post.image} style={{
                  width: "100%", maxHeight: "180px", objectFit: "cover",
                  borderRadius: "8px", marginBottom: "10px",
                }} />
              )}
              <div style={{ fontSize: "12px", color: "#444", marginBottom: "12px" }}>
                ♡ {post.likes} · □ {post.commentsCount} · 🚩 {post.reports}
              </div>
              <button
                onClick={() => deletePost(post.postId)}
                style={{
                  padding: "8px 16px", borderRadius: "8px",
                  border: "none", background: "#ff4d4d",
                  color: "#fff", fontSize: "13px", cursor: "pointer",
                }}
              >
                Delete Post
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}