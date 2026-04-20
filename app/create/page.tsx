"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = localStorage.getItem("publicId");
    if (!id) {
      router.replace("/login");
    } else {
      setPublicId(id);
    }
  }, []);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
  }

  async function handleSubmit() {
    if (posting) return;
    if (!content.trim()) {
      setMessage("Write something first");
      return;
    }
    if (!publicId) {
      router.replace("/login");
      return;
    }

    setPosting(true);
    setMessage("");

    let imageUrl: string | null = null;

    try {
      if (image) {
        setMessage("Uploading image...");
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token ?? ""}` },
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.imageUrl) {
          setMessage(uploadData.error || "Image upload failed");
          setPosting(false);
          return;
        }

        imageUrl = uploadData.imageUrl;
      }

      setMessage("Posting...");

      const token = localStorage.getItem("token");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ content, image: imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Failed to create post");
        setPosting(false);
        return;
      }

      if (data.success) {
        const newPost = {
          ...data.post,
          likes: 0,
          commentsCount: 0,
          isLiked: false,
        };

        queryClient.setQueryData(["feed"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                posts: [newPost, ...(old.pages[0]?.posts ?? [])],
              },
              ...old.pages.slice(1),
            ],
          };
        });

        router.replace("/");
      }
    } catch {
      setMessage("Something went wrong. Try again.");
      setPosting(false);
    }
  }

  const charColor = content.length > 450 ? "#ff4d4d" : content.length > 400 ? "#EF9F27" : "#444";

  return (
    <div style={{ background: "#0b0b0c", color: "white", padding: "20px 16px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "620px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <Link href="/" style={{
            background: "none",
            border: "none",
            color: "#555",
            fontSize: "20px",
            cursor: "pointer",
            textDecoration: "none",
            lineHeight: 1,
          }}>←</Link>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Create post</h2>
        </div>

        <div style={{
          background: "#111",
          borderRadius: "16px",
          border: "1px solid #1a1a1a",
          overflow: "hidden",
          marginBottom: "12px",
        }}>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            maxLength={500}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "120px",
              border: "none",
              background: "transparent",
              color: "white",
              fontSize: "16px",
              resize: "none",
              outline: "none",
              padding: "16px",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />

          {imagePreview && (
            <div style={{ position: "relative", margin: "0 16px 12px" }}>
              <img
                src={imagePreview}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  maxHeight: "300px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <button
                onClick={removeImage}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.7)",
                  border: "none",
                  color: "#fff",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >✕</button>
            </div>
          )}

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px 14px",
            borderTop: "1px solid #1a1a1a",
          }}>
            <label style={{ cursor: "pointer", color: "#1e90ff", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e90ff" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {imagePreview ? "Change image" : "Add image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageSelect}
              />
            </label>
            <span style={{ fontSize: "12px", color: charColor }}>
              {content.length}/500
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={posting || !content.trim()}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "999px",
            border: "none",
            background: posting || !content.trim() ? "#1a1a1a" : "#1e90ff",
            color: posting || !content.trim() ? "#444" : "#fff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: posting || !content.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {posting ? message || "Posting..." : "Post"}
        </button>

        {message && !posting && (
          <p style={{
            marginTop: "12px",
            fontSize: "13px",
            color: message.includes("failed") || message.includes("wrong") || message.includes("empty") || message.includes("first")
              ? "#ff4d4d" : "#888",
            textAlign: "center",
          }}>
            {message}
          </p>
        )}

      </div>
    </div>
  );
}