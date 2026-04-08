import * as jwt from "jsonwebtoken";

export function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    return decoded;
  } catch {
    return null;
  }
}