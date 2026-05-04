import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  email?: string;
  displayName?: string;
};

const password = process.env.SESSION_SECRET || "dev-only-secret-change-me-in-production-12345678";

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "remoteote_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return { id: session.userId, email: session.email!, displayName: session.displayName! };
}
