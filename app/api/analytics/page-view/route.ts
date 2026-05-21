import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { analyticsCookieName } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { getTrackedRoute } from "@/lib/tracked-route";

type Payload = {
  path?: string;
  routeType?: string;
  routeSlug?: string;
  routeLabel?: string;
};

export async function POST(request: Request) {
  let payload: Payload;

  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const path = typeof payload.path === "string" ? payload.path : "";
  const route = getTrackedRoute(path);

  if (!route) {
    return NextResponse.json({ error: "Маршрут не поддерживается для аналитики." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(analyticsCookieName)?.value;
  const visitorId = existingVisitorId || randomUUID();
  const session = await getServerSession(authOptions);

  await prisma.pageView.create({
    data: {
      path: route.path,
      routeType: route.routeType,
      routeSlug: route.routeSlug,
      routeLabel: typeof payload.routeLabel === "string" && payload.routeLabel.trim() ? payload.routeLabel.trim() : route.routeLabel,
      visitorId,
      userId: session?.user?.id || null
    }
  });

  const response = new NextResponse(null, { status: 204 });

  if (!existingVisitorId) {
    response.cookies.set({
      name: analyticsCookieName,
      value: visitorId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  return response;
}
