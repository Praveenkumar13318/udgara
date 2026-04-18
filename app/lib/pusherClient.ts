import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;

if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key) {
    console.error("❌ PUSHER KEY MISSING");
  } else {
    pusherClient = new PusherClient(key, {
      cluster: cluster || "ap2",
    });
  }
}

export { pusherClient };