import { PublishStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

const MAX_COMMENT_LENGTH = 2000;

type CreateCommentBody = {
  itemId?: unknown;
  itemSlug?: unknown;
  body?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  if (!MVP_USER_FEATURES.comments) {
    return jsonError("Комментарии временно недоступны.", 404);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Войдите, чтобы оставить комментарий.", 401);
  }

  let payload: CreateCommentBody;

  try {
    payload = (await request.json()) as CreateCommentBody;
  } catch {
    return jsonError("Некорректный формат запроса.");
  }

  const itemId = typeof payload.itemId === "string" ? payload.itemId.trim() : "";
  const itemSlug = typeof payload.itemSlug === "string" ? payload.itemSlug.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";

  if (!itemId && !itemSlug) {
    return jsonError("Нужно передать itemId или itemSlug.");
  }

  if (!body) {
    return jsonError("Комментарий не может быть пустым.");
  }

  if (body.length > MAX_COMMENT_LENGTH) {
    return jsonError(`Комментарий должен быть не длиннее ${MAX_COMMENT_LENGTH} символов.`);
  }

  const item = await prisma.item.findFirst({
    where: {
      ...(itemId ? { id: itemId } : { slug: itemSlug }),
      status: PublishStatus.PUBLISHED
    },
    select: {
      id: true
    }
  });

  if (!item) {
    return jsonError("Опубликованная вещь не найдена.", 404);
  }

  const comment = await prisma.comment.create({
    data: {
      itemId: item.id,
      userId: session.user.id,
      body
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        body: comment.body,
        author: comment.user.name ?? comment.user.email ?? "Пользователь",
        isHidden: comment.isHidden,
        createdAt: comment.createdAt
      }
    },
    { status: 201 }
  );
}
