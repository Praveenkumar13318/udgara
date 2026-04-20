"use client";
import { useAuthStore } from "@/store/authStore";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import Providers from "./providers";
import { useRouter } from "next/navigation";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [menuOpen, setMenuOpen] = useState(false);
  const { user, hydrate, logout } = useAuthStore();

useEffect(() => {
  hydrate();
}, []);

const router = useRouter();



function handleLogout() {
  logout();
  router.push("/login");
}
 const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: 2,
    color: "#bbb",
    textDecoration: "none",
    padding: "13px 16px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 500,
    transition: "background 0.15s ease, color 0.15s ease",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  };

  const MenuIcon = ({ path, color = "#555" }: { path: string; color?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ flexShrink: 0 }}
    >
      <path d={path} stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111111" />
      </head>

      <body
        style={{
          margin: 0,
          background: "#0b0b0c",
          color: "#f1f1f1",
          fontFamily: "system-ui, Arial, sans-serif",
        }}
      >

        {/* ================= HEADER ================= */}

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            background: "rgba(15,15,15,0.9)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)"
          }}
        >

          <Link href="/" style={{ textDecoration: "none", color: "white" }}>
            <h2
              style={{
                margin: 0,
                fontWeight: 700,
                letterSpacing: "-0.3px"
              }}
            >
              Udgara
            </h2>
          </Link>

          {user?.publicId && (
            <div
              className="no-select"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "13px",
                color: "#888",
                letterSpacing: "1.2px",
                fontWeight: 500
              }}
            >
              {user?.publicId.toUpperCase()}
            </div>
          )}

          {/* Hamburger */}

          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="no-select"
            style={{
              width: 26,
              height: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span style={{
              height: 2,
              width: "100%",
              background: "#fff",
              borderRadius: 2,
              transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
              transition: "all 0.3s ease"
            }} />

            <span style={{
              height: 2,
              width: "100%",
              background: "#fff",
              borderRadius: 2,
              opacity: menuOpen ? 0 : 1,
              transition: "all 0.2s ease"
            }} />

            <span style={{
              height: 2,
              width: "100%",
              background: "#fff",
              borderRadius: 2,
              transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
              transition: "all 0.3s ease"
            }} />
          </div>

        </header>

        {/* ================= OVERLAY ================= */}

        <div
  onClick={() => setMenuOpen(false)}
  className="no-select"
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    zIndex: 1500,
    opacity: menuOpen ? 1 : 0,
    pointerEvents: menuOpen ? "auto" : "none",
    transition: "opacity 0.32s ease",
  }}
/>
        

        {/* ================= MENU ================= */}

        {menuOpen && (
          <div
  style={{
    position: "fixed",
    top: 0,
    right: 0,
    width: 260,
    height: "100vh",
    background: "rgba(14,14,16,0.97)",
    backdropFilter: "blur(20px)",
    borderLeft: "1px solid rgba(255,255,255,0.07)",
    padding: "0",
    zIndex: 2000,
    transform: menuOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
    boxShadow: "-12px 0 40px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  }}
>

            {/* MENU HEADER */}
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 20px 0",
  marginBottom: "8px",
}}>
  <div>
    <div style={{ fontSize: "11px", color: "#444", letterSpacing: "1px", textTransform: "uppercase" }}>
      Logged in as
    </div>
    <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: "monospace", letterSpacing: "1px" }}>
      {user?.publicId?.toUpperCase() || "GUEST"}
    </div>
  </div>
  <div
    onClick={() => setMenuOpen(false)}
    style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "16px",
      color: "#888",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >✕</div>
</div>

{/* DIVIDER */}
<div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

{/* NAV LINKS - replace the padding on all links */}

            {/* NAV LINKS */}
            <div style={{ padding: "0 8px" }}>

              <Link href="/" style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <MenuIcon path="M3 12L12 4l9 8M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
                Home
              </Link>

              {user?.publicId && (
                <Link href={`/profile/${user?.publicId}`} style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MenuIcon path="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  My Profile
                </Link>
              )}

              {user?.publicId && (
                <Link href="/create" style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MenuIcon path="M12 5v14M5 12h14" />
                  Create Post
                </Link>
              )}

            </div>

            {user?.publicId && (
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            )}

            {user?.publicId && (
              <div style={{ padding: "0 8px" }}>
                <Link href="/terms" style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MenuIcon path="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                  Terms & Conditions
                </Link>

                <Link href="/privacy" style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MenuIcon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  Privacy Policy
                </Link>
              </div>
            )}

            {user?.publicId && (
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            )}

            {user?.publicId && (
              <div style={{ padding: "0 8px" }}>
                <Link href="/about" style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MenuIcon path="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                  About Udgara
                </Link>
              </div>
            )}

            {user?.publicId ? (
              <div style={{ padding: "0 8px", marginTop: "auto", paddingBottom: "32px" }}>
  <div
    onClick={handleLogout}
    className="no-select"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      color: "#ff4d4d",
      cursor: "pointer",
      padding: "13px 16px",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: 500,
      WebkitTapHighlightColor: "transparent",
      touchAction: "manipulation",
      transition: "background 0.15s ease",
    }}
    onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,77,77,0.1)")}
    onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <MenuIcon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" color="#ff4d4d" />
    Logout
  </div>
</div>
            ) : (
              <Link href="/login" style={linkStyle}
  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
  onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
>
  <MenuIcon path="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
  Login
</Link>            )}

          </div>
        )}

        {/* ================= MAIN ================= */}

        <Providers>
  
    {children}
 
</Providers>
      </body>
    </html>
  );
}