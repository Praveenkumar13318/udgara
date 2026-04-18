import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;
if (typeof window !== "undefined") {
  pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY!,
    { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2" }
  );
}
export { pusherClient };
