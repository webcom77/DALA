import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("dala_session")?.value;

  if (sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie);
      return NextResponse.json({ user });
    } catch {
      // Ignora JSON corrompido
    }
  }

  return NextResponse.json({ user: null });
}
