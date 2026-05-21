import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function DELETE(_request: Request, context: { params: Promise<{ listId: string }> }) {
  if (!MVP_USER_FEATURES.savedLists) {
    return jsonError("Сохранённые списки временно недоступны.", 404);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Войдите, чтобы удалить список.", 401);
  }

  const { listId } = await context.params;

  const list = await prisma.savedList.findFirst({
    where: {
      id: listId,
      userId: session.user.id
    },
    select: {
      id: true
    }
  });

  if (!list) {
    return jsonError("Список не найден.", 404);
  }

  await prisma.savedList.delete({
    where: {
      id: list.id
    }
  });

  return NextResponse.json({ ok: true });
}
