"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportsAdmin() {

  const [reports,setReports] = useState<any[]>([]);
  const [isAdmin,setIsAdmin] = useState(false);
  const [checked,setChecked] = useState(false);
  const [loading,setLoading] = useState(true);

  const router = useRouter();

  useEffect(()=>{

    const id = localStorage.getItem("publicId");

    if(id === "NP000001"){
      setIsAdmin(true);
      loadReports();
    }else{
      router.replace("/"); // 🔥 better than push (no back navigation)
    }

    setChecked(true);

  },[]);

  async function loadReports(){

    try{
      const publicId = localStorage.getItem("publicId");

      const token = localStorage.getItem("token");

const res = await fetch("/api/admin/reports", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

      if(!res.ok){
        console.error("Failed to load reports");
        return;
      }

      const data = await res.json();
      setReports(data);

    }catch(error){
      console.error("Error loading reports", error);
    }finally{
      setLoading(false);
    }

  }

  async function deletePost(postId:string){

    const confirmDelete = confirm("Delete this post?");
    if(!confirmDelete) return;

    try{
      const publicId = localStorage.getItem("publicId");

      async function deletePost(postId:string){

  const confirmDelete = confirm("Delete this post?");
  if(!confirmDelete) return;

  const token = localStorage.getItem("token");

  await fetch("/api/admin/delete-post",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${token}`
    },
    body:JSON.stringify({
      postId
    })
  });

  loadReports();
}

      loadReports();

    }catch(error){
      console.error("Delete failed", error);
    }

  }

  // 🔒 WAIT FOR CHECK
  if(!checked) return null;

  // 🔒 BLOCK NON-ADMIN
  if(!isAdmin) return null;

  // ⏳ LOADING STATE
  if(loading){
    return (
      <div style={{padding:"40px",textAlign:"center"}}>
        Loading reports...
      </div>
    );
  }

  return(

    <div
      style={{
        maxWidth:"700px",
        margin:"auto",
        padding:"40px"
      }}
    >

      <h1 style={{marginBottom:"30px"}}>
        Reported Posts
      </h1>

      {reports.length === 0 && (
        <div style={{opacity:0.6}}>
          No reported posts
        </div>
      )}

      {reports.map((r)=>{

        const reasonCounts:any = {};

        r.reasons.forEach((reason:string)=>{
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });

        const topReason =
          Object.entries(reasonCounts)
          .sort((a:any,b:any)=>b[1]-a[1])[0]?.[0];

        return(

          <div
            key={r._id}
            style={{
              background:"#1f1f1f",
              padding:"20px",
              borderRadius:"12px",
              marginBottom:"20px"
            }}
          >

            <div style={{marginBottom:"10px"}}>
              Post ID: {r._id}
            </div>

            <div style={{marginBottom:"10px"}}>
              Reports: {r.count}
            </div>

            <div style={{marginBottom:"15px"}}>
              Top Reason: {topReason}
            </div>

            <button
              className="tap"
              onClick={()=>deletePost(r._id)}
              style={{
                background:"#ff4d4d",
                border:"none",
                padding:"8px 14px",
                borderRadius:"6px",
                color:"white",
                cursor:"pointer"
              }}
            >
              Delete Post
            </button>

          </div>

        );

      })}

    </div>

  );

}