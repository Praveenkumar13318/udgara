import { NextResponse } from "next/server";

export function stripId<T extends { _id?: any; [key: string]: any }>(doc: T): Omit<T, "_id"> {
  const { _id, ...rest } = doc;
  return rest;
}

export function stripIds<T extends { _id?: any; [key: string]: any }>(docs: T[]) {
  return docs.map(stripId);
}

export function ok(data: object, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/<[^>]*>/g, "");
}

export function validateContent(content: unknown): string | null {
  if (typeof content !== "string") return "Content must be text";
  const clean = content.trim();
  if (clean.length < 3) return "Content too short (min 3 chars)";
  if (clean.length > 2000) return "Content too long (max 2000 chars)";
  return null;
}