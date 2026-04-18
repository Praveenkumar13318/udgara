"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetcher";
export default function CreatePost() {

  const router = useRouter();

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
const queryClient = useQueryClient();
  const [publicId, setPublicId] = useState<string | null>(null);

  /* ✅ FIX: safely load publicId */
  useEffect(() => {
    const id = localStorage.getItem("publicId");
    if (!id) {
      router.replace("/login");
    } else {
      setPublicId(id);
    }
  }, []);

  async function handleSubmit() {

    if (posting) return;

    if (!content.trim()) {
      setMessage("Post cannot be empty");
      return;
    }

    if (!publicId) {
      setMessage("Login required");
      return;
    }

    setPosting(true);
    setMessage("Posting...");

    let imageUrl: string | null = null;

    try {

      if (image) {

        const formData = new FormData();
        formData.append("file", image);

        const token = localStorage.getItem("token");
const uploadRes = await fetch("/api/upload", {
  method: "POST",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
  body: formData
});

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setMessage(uploadData.error || "Image upload failed");
          setPosting(false);
          return;
        }

        if (!uploadData.imageUrl) {
  setMessage("Image upload failed");
  setPosting(false);
  return;
}

imageUrl = uploadData.imageUrl;
      }

      const res = await fetchWithAuth("/api/posts", {
  method: "POST",
  body: JSON.stringify({
    content,
    image: imageUrl,
  })
});
console.log("POST RESPONSE STATUS:", res.status);
      let data;

try {
  data = await res.json();
} catch {
  setMessage("Invalid server response");
  setPosting(false);
  return;
}

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
}; // 👈 make sure backend returns post

  queryClient.setQueryData(["feed"], (oldData: any) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: [
        {
          ...oldData.pages[0],
          posts: [newPost, ...oldData.pages[0].posts]
        },
        ...oldData.pages.slice(1)
      ]
    };
  });

  router.replace("/");
}
       else {
        setMessage(data.error || "Failed to create post");
      }

    } catch (error) {
      console.log("CREATE POST ERROR:", error);
      setMessage("Server error");
    }

    setPosting(false);
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        padding: "20px 14px"
      }}
    >

      <div
        style={{
          maxWidth: "620px",
          margin: "0 auto",
        }}
      >

        <h2 style={{ marginBottom: "14px", fontSize: "20px" }}>
          Create Post
        </h2>

        <div
          style={{
            background: "#141414",
            borderRadius: "14px",
            border: "1px solid #2a2a2a",
            padding: "16px"
          }}
        >

          <textarea
            placeholder="What's happening?"
            value={content}
            maxLength={500}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "110px",
              border: "none",
              background: "transparent",
              color: "white",
              fontSize: "16px",
              resize: "none",
              outline: "none"
            }}
          />

          {image && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={URL.createObjectURL(image)}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  maxHeight: "280px",
                  objectFit: "cover"
                }}
              />
            </div>
          )}

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <label style={{ cursor: "pointer", color: "#1e90ff" }}>
              📷 Add Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setImage(e.target.files[0]);
                  }
                }}
              />
            </label>

            <div style={{ fontSize: "12px", color: "#777" }}>
              {content.length}/500
            </div>

          </div>

        </div>

        <button
          onClick={handleSubmit}
          disabled={posting}
          style={{
            marginTop: "14px",
            width: "100%",
            padding: "12px",
            borderRadius: "999px",
            border: "none",
            background: posting ? "#333" : "#1e90ff",
            color: "white",
            fontWeight: 600,
            cursor: posting ? "not-allowed" : "pointer"
          }}
        >
          {posting ? "Posting..." : "Post"}
        </button>

        {message && (
          <p style={{ marginTop: "12px", color: "#aaa", fontSize: "13px" }}>
            {message}
          </p>
        )}

      </div>

    </div>

  );
}