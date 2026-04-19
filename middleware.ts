import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const limiters: Record<string, Ratelimit> = {
  auth:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "5m"),  prefix: "rl:auth" }),
  posts:   new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1m"),  prefix: "rl:posts" }),
  like:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1m"), prefix: "rl:like" }),
  comment: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1m"), prefix: "rl:comment" }),
  upload:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1m"),  prefix: "rl:upload" }),
  default: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1m"), prefix: "rl:default" }),
};

function getLimiter(pathname: string, method: string): Ratelimit | null {
  if (pathname.startsWith("/api/auth"))    return limiters.auth;
  if (pathname.startsWith("/api/upload"))  return limiters.upload;
  if (pathname === "/api/like")            return limiters.like;
  if (pathname.startsWith("/api/comments") && method === "POST") return limiters.comment;
  if (pathname === "/api/posts" && method === "POST") return limiters.posts;
  if (pathname === "/api/posts" && method === "GET")  return null; // feed is public, no limit
  if (pathname.startsWith("/api/comments") && method === "GET") return null; // reads are free
  return limiters.default;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  const limiter = getLimiter(pathname, req.method);
  if (!limiter) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};