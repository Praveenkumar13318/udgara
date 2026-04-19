"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  async function sendOtp() {
    if (!email.trim()) return;
    setLoading(true);
    setMessage("Sending...");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setStep("otp");
        setMessage("");
      } else {
        setMessage(data.error || "Failed to send OTP");
      }
    } catch {
      setMessage("Network error. Try again.");
    }
    setLoading(false);
  }

  async function verifyOtp() {
    if (!otp.trim()) return;
    setLoading(true);
    setMessage("Verifying...");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.error || "Verification failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      setUser({ publicId: data.publicId.toUpperCase() });
      router.push("/");
    } catch {
      setMessage("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
    }}>

      {/* BRAND */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          fontSize: "36px",
          fontWeight: 800,
          letterSpacing: "-1px",
          color: "#ffffff",
          marginBottom: "8px",
        }}>
          Udgara
        </div>
        <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
          Share your thoughts. Stay anonymous.
        </p>
      </div>

      {/* CARD */}
      <div style={{
        width: "100%",
        maxWidth: "380px",
        background: "#111",
        borderRadius: "20px",
        border: "1px solid #222",
        padding: "28px 24px",
      }}>

        {step === "email" && (
          <>
            <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "8px", marginTop: 0 }}>
              Enter your email to continue
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              autoFocus
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: "10px",
                border: "1px solid #2a2a2a",
                background: "#0b0b0c",
                color: "#ffffff",
                fontSize: "15px",
                outline: "none",
                marginBottom: "12px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={sendOtp}
              disabled={loading || !email.trim()}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "999px",
                border: "none",
                background: loading || !email.trim() ? "#1c1c1c" : "#1e90ff",
                color: loading || !email.trim() ? "#555" : "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <p style={{ fontSize: "12px", color: "#555", marginTop: "16px", textAlign: "center" }}>
              By continuing you agree to our{" "}
              <Link href="/terms" style={{ color: "#888", textDecoration: "underline" }}>
                Terms & Conditions
              </Link>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={() => { setStep("email"); setMessage(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "20px",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ←
              </button>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff" }}>
                  Check your email
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                  Code sent to {email}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "8px", marginTop: 0 }}>
              6-digit code
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              autoFocus
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: "10px",
                border: "1px solid #2a2a2a",
                background: "#0b0b0c",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "10px",
                outline: "none",
                marginBottom: "12px",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "999px",
                border: "none",
                background: loading || otp.length < 6 ? "#1c1c1c" : "#22c55e",
                color: loading || otp.length < 6 ? "#555" : "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading || otp.length < 6 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <div
              onClick={() => !loading && sendOtp()}
              style={{
                textAlign: "center",
                marginTop: "14px",
                fontSize: "13px",
                color: "#555",
                cursor: "pointer",
              }}
            >
              Didn't get it?{" "}
              <span style={{ color: "#1e90ff" }}>Resend code</span>
            </div>
          </>
        )}

        {message && (
          <p style={{
            marginTop: "12px",
            fontSize: "13px",
            color: message.toLowerCase().includes("error") ||
                   message.toLowerCase().includes("failed") ||
                   message.toLowerCase().includes("invalid") ||
                   message.toLowerCase().includes("expired")
              ? "#ff4d4d" : "#888",
            textAlign: "center",
            margin: "12px 0 0",
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}