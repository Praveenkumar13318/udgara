"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportsAdmin() {

  const [reports,setReports] = useState<any[]>([]);
  const [isAdmin,setIsAdmin] = useState(false);
  const [checked,setChecked] = useState(false);

  const router = useRouter();

  useEffect(()=>{

    const id = localStorage.getItem("publicId");

    if(id === "NP000001"){
      setIsAdmin(true);
      loadReports();
    }else{
      router.push("/");
    }

    setChecked(true);

  },[]);

  async function loadReports(){

    const publicId = localStorage.getItem("publicId");

    const res = await fetch(`/api/admin/reports?publicId=${publicId}`);
    const data = await res.json();

    setReports(data);

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
        publicId
      })
    });

    loadReports();

  }

  // 🔒 block UI until check
  if(!checked) return null;

  // 🔒 block non-admin
  if(!isAdmin) return null;

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