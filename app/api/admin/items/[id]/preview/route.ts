import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/db";

type UpdatePreviewBody = {
  previewImageUrl?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin.response) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!id) {
    return jsonError("Вещь не найдена.", 404);
  }

  let payload: UpdatePreviewBody;

  try {
    payload = (await request.json()) as UpdatePreviewBody;
  } catch {
    return jsonError("Некорректный формат запроса.");
  }

  const previewImageUrl =
    typeof payload.previewImageUrl === "string" ? payload.previewImageUrl.trim() : "";

  if (!previewImageUrl) {
    return jsonError("Нужно передать URL превью.", 400);
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      previewImageUrl
    },
    select: {
      id: true,
      previewImageUrl: true
    }
  });

  return NextResponse.json({ item });
}
