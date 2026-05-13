"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const STATIC_PASSWORD = "Firfisle#32";
const COOKIE_NAME = "scrum_auth";
const COOKIE_VALUE = "authenticated";

export async function login(password: string): Promise<boolean> {
  if (password === STATIC_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }
}
