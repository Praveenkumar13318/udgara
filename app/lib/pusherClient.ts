import Pusher from "pusher-js";

export const pusherClient = new Pusher("YOUR_KEY", {
  cluster: "ap2"
});