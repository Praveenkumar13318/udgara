"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("publicId");
    setPublicId(id);
  }, []);

  function logout() {
    localStorage.removeItem("publicId");
    window.location.href = "/login";
  }

  const linkStyle = {
    display: "block",
    marginBottom: 18,
    color: "#ddd",
    textDecoration: "none",
    padding: "10px 10px",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    transform: "scale(1)"
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

          {publicId && (
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
              {publicId.toUpperCase()}
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

        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="no-select"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              zIndex: 1500
            }}
          />
        )}

        {/* ================= MENU ================= */}

        {menuOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 260,
              height: "100vh",
              background: "rgba(18,18,18,0.95)",
              backdropFilter: "blur(12px)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              padding: 24,
              zIndex: 2000,
              transform: "translateX(0)",
              transition: "transform 0.35s ease",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.6)"
            }}
          >

            <div
              style={{
                marginBottom: 20,
                cursor: "pointer",
                textAlign: "right",
                fontSize: 18,
                color: "#aaa"
              }}
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </div>

            <Link href="/" style={linkStyle}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onMouseDown={pressIn} onMouseUp={pressOut}
            >
              Home
            </Link>

            {publicId && (
              <Link href={`/profile/${publicId}`} style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                My Profile
              </Link>
            )}

            {publicId && (
              <Link href="/create" style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                Create Post
              </Link>
            )}

            {publicId && <div style={{ height: 1, background: "#1f1f1f", margin: "18px 0" }} />}

            {publicId && (
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

            {publicId && <div style={{ height: 1, background: "#1f1f1f", margin: "18px 0" }} />}

            {publicId && (
              <Link href="/about" style={linkStyle}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onMouseDown={pressIn} onMouseUp={pressOut}
              >
                About Udgara
              </Link>
            )}

            {publicId ? (
              <div
                onClick={logout}
                onMouseDown={pressIn}
                onMouseUp={pressOut}
                className="no-select"
                style={{
                  marginTop: 20,
                  color: "#ff4d4d",
                  cursor: "pointer"
                }}
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

        <main
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "16px 14px"
          }}
        >
          {children}
        </main>

      </body>
    </html>
  );
}