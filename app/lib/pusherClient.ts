import Pusher from "pusher-js";

let pusherClient: any = null;

if (typeof window !== "undefined") {
  pusherClient = new Pusher("aab1327f4bbb5674510e", {
    cluster: "ap2"
  });
}

export { pusherClient };