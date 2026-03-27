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
    padding: "8px 8px",
    borderRadius: "8px",
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
          background: "#0f0f0f",
          color: "#f1f1f1",
          fontFamily: "system-ui, Arial, sans-serif",
        }}
      >

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",

            /* 🔥 PREMIUM HEADER */
            background: "rgba(17,17,17,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.6)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",

            position: "sticky",
            top: 0,
            zIndex: 100
          }}
        >

          <Link href="/" style={{ textDecoration: "none", color: "white" }}>
            <h2 style={{ margin: 0, fontWeight: 600 }}>Udgara</h2>
          </Link>

          {publicId && (
            <div
              className="no-select"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "13px",
                color: "#aaa",
                letterSpacing: "1px",

                /* 🔥 BADGE STYLE */
                padding: "4px 10px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(6px)",

                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none"
              }}
            >
              {publicId.toUpperCase()}
            </div>
          )}

          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="no-select"
            style={{
              width: 26,
              height: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              userSelect: "none"
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
              transition: "all 0.3s ease"
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

        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="no-select"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              zIndex: 1500,
              transition: "opacity 0.3s ease"
            }}
          />
        )}

        {menuOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 260,
              height: "100vh",
              background: "#121212",
              borderLeft: "1px solid #2a2a2a",
              padding: 24,
              zIndex: 2000,
              transform: menuOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.6)"
            }}
          >

            <div
              style={{
                marginBottom: 20,
                cursor: "pointer",
                textAlign: "right",
                fontSize: 18
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