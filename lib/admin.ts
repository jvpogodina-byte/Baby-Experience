import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type AdminSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
    role: "ADMIN";
  };
};

function adminJsonError(message: string, status: number) {
  return NextResponse.json({ message, error: message }, { status });
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session as AdminSession;
}

export async function requireAdminApi(): Promise<
  { session: AdminSession; response?: never } | { session?: never; response: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      response: adminJsonError("Нужно войти под аккаунтом администратора.", 401)
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      response: adminJsonError("Действие доступно только администратору.", 403)
    };
  }

  return {
    session: session as AdminSession
  };
}
