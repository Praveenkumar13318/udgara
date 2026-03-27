"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {

  const [posts,setPosts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(()=>{

    // 🔐 ADMIN CHECK
    const id = localStorage.getItem("publicId");

    if(id !== "NP000001"){
      router.push("/");
      return;
    }

    loadPosts();

  },[]);

  async function loadPosts(){

    const res = await fetch("/api/posts");
    const data = await res.json();

    setPosts(data);

  }

  async function deletePost(postId:string){

    const confirmDelete = confirm("Delete this post?");
    if(!confirmDelete) return;

    const publicId = localStorage.getItem("publicId");

    await fetch("/api/admin/delete-post",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        postId,
        publicId // 🔥 IMPORTANT (security)
      })
    });

    loadPosts();

  }

  return(

    <main
      style={{
        maxWidth:"700px",
        margin:"40px auto",
        padding:"20px",
        color:"white"
      }}
    >

      <h1 style={{marginBottom:"30px"}}>
        Admin Dashboard
      </h1>

      {posts.map((post)=>(

        <div
          key={post._id}
          style={{
            background:"#1e1e1e",
            padding:"20px",
            borderRadius:"10px",
            marginBottom:"20px"
          }}
        >

          <div style={{color:"#aaa"}}>
            {post.npId}
          </div>

          <div style={{fontSize:"18px",marginBottom:"10px"}}>
            {post.content}
          </div>

          {post.image &&(
            <img
              src={post.image}
              style={{
                width:"100%",
                borderRadius:"8px"
              }}
            />
          )}

          <div style={{marginTop:"10px"}}>
            ❤️ {post.likes} | 💬 {post.commentsCount} | 🚩 {post.reports}
          </div>

          <button
            className="tap"
            onClick={()=>deletePost(post.postId)}
            style={{
              marginTop:"10px",
              background:"red",
              border:"none",
              padding:"8px 12px",
              color:"white",
              cursor:"pointer"
            }}
          >
            Delete Post
          </button>

        </div>

      ))}

    </main>

  );

}