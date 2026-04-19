import { ImageResponse } from "next/og";
import { connectDB } from "@/app/lib/mongodb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return defaultCard("Udgara", "Share your thoughts. Stay anonymous.");
    }

    const db = await connectDB();
    const post = await db.collection("posts").findOne({ postId });

    if (!post) {
      return defaultCard("Udgara", "Share your thoughts. Stay anonymous.");
    }

    const npId = (post.npId || "NPXXXXXX").toUpperCase();
    const content = post.content || "";
    const truncated = content.length > 180
      ? content.slice(0, 180) + "..."
      : content;

    const likesCount = post.likes ?? 0;
    const commentsCount = post.commentsCount ?? 0;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            background: "#0b0b0c",
            display: "flex",
            flexDirection: "column",
            padding: "0",
            position: "relative",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* TOP ACCENT BAR */}
          <div style={{
            width: "100%",
            height: "4px",
            background: "linear-gradient(90deg, #1e90ff, #0066ff)",
            display: "flex",
          }} />

          {/* MAIN CONTENT */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "52px 64px 40px",
          }}>

            {/* NPID BADGE */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}>
              <div style={{
                background: "rgba(30,144,255,0.12)",
                border: "1px solid rgba(30,144,255,0.3)",
                borderRadius: "8px",
                padding: "6px 16px",
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e90ff",
                letterSpacing: "2px",
                display: "flex",
              }}>
                {npId}
              </div>
              <div style={{
                fontSize: "16px",
                color: "#333",
                display: "flex",
              }}>
                on Udgara
              </div>
            </div>

            {/* POST CONTENT */}
            <div style={{
              fontSize: truncated.length > 100 ? "32px" : "40px",
              color: "#f0f0f0",
              lineHeight: 1.5,
              flex: 1,
              display: "flex",
              alignItems: "center",
              fontWeight: 500,
            }}>
              {truncated}
            </div>

            {/* BOTTOM ROW */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              borderTop: "1px solid #1a1a1a",
              paddingTop: "24px",
            }}>

              {/* STATS */}
              <div style={{
                display: "flex",
                gap: "28px",
                alignItems: "center",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                  color: "#555",
                }}>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid #555",
                    display: "flex",
                  }} />
                  <span style={{ display: "flex" }}>{likesCount} likes</span>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                  color: "#555",
                }}>
                  <div style={{
                    width: "20px",
                    height: "16px",
                    border: "2px solid #555",
                    borderRadius: "4px",
                    display: "flex",
                  }} />
                  <span style={{ display: "flex" }}>{commentsCount} comments</span>
                </div>
              </div>

              {/* BRAND */}
              <div style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#222",
                letterSpacing: "-0.5px",
                display: "flex",
              }}>
                udgara.vercel.app
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

  } catch (err) {
    console.error("[OG route error]", err);
    return defaultCard("Udgara", "Share your thoughts. Stay anonymous.");
  }
}

function defaultCard(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div style={{
        width: "1200px",
        height: "630px",
        background: "#0b0b0c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{
          fontSize: "72px",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-2px",
          display: "flex",
        }}>
          {title}
        </div>
        <div style={{
          fontSize: "24px",
          color: "#444",
          marginTop: "16px",
          display: "flex",
        }}>
          {subtitle}
        </div>
        <div style={{
          marginTop: "40px",
          background: "rgba(30,144,255,0.1)",
          border: "1px solid rgba(30,144,255,0.2)",
          borderRadius: "999px",
          padding: "10px 28px",
          fontSize: "18px",
          color: "#1e90ff",
          display: "flex",
        }}>
          Share your thoughts. Stay anonymous.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}