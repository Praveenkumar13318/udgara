"use client";

import { useEffect, useState } from "react";

export default function ReportsAdmin() {

  const [reports,setReports] = useState<any[]>([]);

  useEffect(()=>{
    loadReports();
  },[]);

  async function loadReports(){

    const res = await fetch("/api/admin/reports");
    const data = await res.json();

    setReports(data);

  }

  async function deletePost(postId:string){

    await fetch("/api/admin/delete-post",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({ postId })
    });

    loadReports();

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
              onClick={()=>deletePost(r._id)}
              style={{
                background:"#ff4d4d",
                border:"none",
                padding:"8px 14px",
                borderRadius:"6px",
                cursor:"pointer",
                color:"white"
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