import Pusher from "pusher";

export const pusher = new Pusher({
  appId: "2142664",
  key: "aab1327f4bbb5674510e",
  secret: "934957a1b7a2b563b999",
  cluster: "ap2",
  useTLS: true
});