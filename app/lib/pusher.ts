import Pusher from "pusher";

if (!process.env.PUSHER_APP_ID) throw new Error("Missing PUSHER_APP_ID");
if (!process.env.PUSHER_SECRET) throw new Error("Missing PUSHER_SECRET");

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER ?? "ap2",
  useTLS: true,
});
