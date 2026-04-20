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
  gap: "12px",
  marginBottom: 4,
  color: "#ccc",
  textDecoration: "none",
  padding: "13px 20px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: 500,
  transition: "background 0.15s ease, color 0.15s ease",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};

  const hoverIn = (e: any) => (e.currentTarget.style.background = "#1a1a1a");
  const hoverOut = (e: any) => (e.currentTarget.style.background = "transparent");

  const pressIn = (e: any) => (e.currentTarget.style.transform = "scale(0.96)");
  const pressOut = (e: any) => (e.currentTarget.style.transform = "scale(1)");

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

            <Link href="/" style={linkStyle}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onMouseDown={pressIn} onMouseUp={pressOut}
            >
              Home
            </Link>

            {user?.publicId && (
              <Link href={`/profile/${user?.publicId}`} style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                My Profile
              </Link>
            )}

            {user?.publicId && (
              <Link href="/create" style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                Create Post
              </Link>
            )}

            {user?.publicId && <div style={{ height: 1, background: "#1f1f1f", margin: "18px 0" }} />}

            {user?.publicId && (
              <>
                <Link href="/terms" style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                  onMouseDown={pressIn} onMouseUp={pressOut}
                >
                  Terms & Conditions
                </Link>

                <Link href="/privacy" style={linkStyle}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                  onMouseDown={pressIn} onMouseUp={pressOut}
                >
                  Privacy Policy
                </Link>
              </>
            )}

            {user?.publicId && <div style={{ height: 1, background: "#1f1f1f", margin: "18px 0" }} />}

            {user?.publicId && (
              <Link href="/about" style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                About Udgara
              </Link>
            )}

            {user?.publicId ? (
              <div
  onClick={handleLogout}
  className="no-select"
  style={{
    margin: "8px 12px",
    color: "#ff4d4d",
    cursor: "pointer",
    padding: "13px 20px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 500,
    background: "rgba(255,77,77,0.06)",
    border: "1px solid rgba(255,77,77,0.12)",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  }}
  onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,77,77,0.14)")}
  onTouchEnd={(e) => (e.currentTarget.style.background = "rgba(255,77,77,0.06)")}
>
  Logout
</div>
            ) : (
              <Link href="/login" style={linkStyle}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                Login
              </Link>
            )}

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