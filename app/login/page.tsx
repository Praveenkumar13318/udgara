"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"landing" | "email" | "otp">("landing");
  const [message, setMessage] = useState("");

  async function sendOtp() {
    try {
      setMessage("Sending OTP...");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success !== false) {
        setStep("otp");
        setMessage("OTP sent to email");
      } else {
        setMessage(data.error || "Failed");
      }
    } catch {
      setMessage("Network error");
    }
  }

  async function verifyOtp() {
    try {
      setMessage("Verifying...");

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "Verification failed");
        return;
      }

      // 🔥 RESET SESSION
      localStorage.clear();

      // 🔐 STRICT VALIDATION
      if (!data.token || !data.publicId) {
        setMessage("Login failed: missing credentials");
        return;
      }

      // 🔐 STORE SECURELY
      localStorage.setItem("token", data.token);
      localStorage.setItem("publicId", data.publicId.toUpperCase());

      // 🔥 ENSURE STORAGE BEFORE REDIRECT
      setTimeout(() => {
        window.location.href = "/";
      }, 100);

    } catch {
      setMessage("Network error");
    }
  }

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#141414",
          padding: "28px",
          borderRadius: "16px",
          border: "1px solid #2a2a2a",
          boxShadow: "0 20px 40px rgba(0,0,0,0.7)"
        }}
      >

        {step === "landing" && (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 20 }}>
              Join Udgara
            </h1>

            <button
              onClick={() => setStep("email")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "999px",
                border: "none",
                background: "#1e90ff",
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Create Account
            </button>

            <p style={{ marginTop: 18, fontSize: 12, color: "#666" }}>
              By continuing, you agree to our{" "}
              <Link href="/terms" style={{ color: "#1e90ff" }}>
                Terms & Conditions
              </Link>
            </p>
          </>
        )}

        {step === "email" && (
          <>
            <h2 style={{ marginBottom: 20 }}>Enter your email</h2>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #333",
                background: "#0f0f0f",
                color: "white"
              }}
            />

            <button
              onClick={sendOtp}
              style={{
                width: "100%",
                padding: "12px",
                background: "#1e90ff",
                border: "none",
                borderRadius: "999px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Send OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 style={{ marginBottom: 20 }}>Enter OTP</h2>

            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #333",
                background: "#0f0f0f",
                color: "white"
              }}
            />

            <button
              onClick={verifyOtp}
              style={{
                width: "100%",
                padding: "12px",
                background: "#22c55e",
                border: "none",
                borderRadius: "999px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Verify & Continue
            </button>
          </>
        )}

        {message && (
          <p style={{ marginTop: 14, color: "#aaa", fontSize: 13 }}>
            {message}
          </p>
        )}

      </div>
    </div>
  );
}