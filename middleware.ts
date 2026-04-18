import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/posts":    { max: 5,  windowMs: 60_000 },
  "/api/like":     { max: 20, windowMs: 60_000 },
  "/api/comments": { max: 10, windowMs: 60_000 },
  "/api/auth":     { max: 5,  windowMs: 300_000 },
  "/api/upload":   { max: 3,  windowMs: 60_000 },
};

function getLimit(pathname: string) {
  for (const [route, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(route)) return limit;
  }
  return { max: 30, windowMs: 60_000 };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) return NextResponse.next();

  if (req.method === "GET" && pathname === "/api/posts") {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const { max, windowMs } = getLimit(pathname);

  const entry = rateLimitMap.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimitMap.set(key, entry);

  if (entry.count > max) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};