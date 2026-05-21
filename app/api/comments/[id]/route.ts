import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/db";

type UpdateCommentBody = {
  isHidden?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin.response) {
    return admin.response;
  }

  let payload: UpdateCommentBody;

  try {
    payload = (await request.json()) as UpdateCommentBody;
  } catch {
    return jsonError("Некорректный формат запроса.");
  }

  if (typeof payload.isHidden !== "boolean") {
    return jsonError("Поле isHidden должно быть boolean.");
  }

  const { id } = await context.params;

  const existingComment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!existingComment) {
    return jsonError("Комментарий не найден.", 404);
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: {
      isHidden: payload.isHidden
    },
    select: {
      id: true,
      isHidden: true,
      updatedAt: true
    }
  });

  return NextResponse.json({ comment });
}
