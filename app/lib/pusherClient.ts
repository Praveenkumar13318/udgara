import Pusher from "pusher-js";

let pusherClient: any = null;

if (typeof window !== "undefined") {
  pusherClient = new Pusher("YOUR_KEY", {
    cluster: "ap2"
  });
}

export { pusherClient };