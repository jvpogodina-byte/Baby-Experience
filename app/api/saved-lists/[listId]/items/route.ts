import { Prisma, PublishStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

type SavedItemBody = {
  itemId?: unknown;
  itemSlug?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

async function readPayload(request: Request) {
  try {
    return (await request.json()) as SavedItemBody;
  } catch {
    return null;
  }
}

function normalizeItemIdentity(payload: SavedItemBody | null) {
  return {
    itemId: typeof payload?.itemId === "string" ? payload.itemId.trim() : "",
    itemSlug: typeof payload?.itemSlug === "string" ? payload.itemSlug.trim() : ""
  };
}

export async function POST(request: Request, context: { params: Promise<{ listId: string }> }) {
  if (!MVP_USER_FEATURES.savedLists) {
    return jsonError("Сохранённые списки временно недоступны.", 404);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Войдите, чтобы сохранить вещь.", 401);
  }

  const payload = await readPayload(request);
  if (!payload) {
    return jsonError("Некорректный формат запроса.");
  }

  const { itemId, itemSlug } = normalizeItemIdentity(payload);
  if (!itemId && !itemSlug) {
    return jsonError("Нужно передать itemId или itemSlug.");
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

  const item = await prisma.item.findFirst({
    where: {
      ...(itemId ? { id: itemId } : { slug: itemSlug }),
      status: PublishStatus.PUBLISHED
    },
    select: {
      id: true,
      slug: true,
      title: true
    }
  });

  if (!item) {
    return jsonError("Сохранять можно только опубликованные вещи.", 404);
  }

  const existingItem = await prisma.savedItem.findUnique({
    where: {
      listId_itemId: {
        listId: list.id,
        itemId: item.id
      }
    }
  });

  if (existingItem) {
    return NextResponse.json({ savedItem: existingItem, item, alreadySaved: true });
  }

  try {
    const savedItem = await prisma.savedItem.create({
      data: {
        listId: list.id,
        itemId: item.id
      }
    });

    await prisma.savedList.update({
      where: {
        id: list.id
      },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ savedItem, item, alreadySaved: false }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ item, alreadySaved: true });
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ listId: string }> }) {
  if (!MVP_USER_FEATURES.savedLists) {
    return jsonError("Сохранённые списки временно недоступны.", 404);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Войдите, чтобы убрать вещь из списка.", 401);
  }

  const payload = await readPayload(request);
  if (!payload) {
    return jsonError("Некорректный формат запроса.");
  }

  const { itemId, itemSlug } = normalizeItemIdentity(payload);
  if (!itemId && !itemSlug) {
    return jsonError("Нужно передать itemId или itemSlug.");
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

  const item = itemId
    ? { id: itemId }
    : await prisma.item.findUnique({
        where: {
          slug: itemSlug
        },
        select: {
          id: true
        }
      });

  if (!item) {
    return jsonError("Вещь не найдена.", 404);
  }

  await prisma.savedItem.deleteMany({
    where: {
      listId: list.id,
      itemId: item.id
    }
  });

  await prisma.savedList.update({
    where: {
      id: list.id
    },
    data: {
      updatedAt: new Date()
    }
  });

  return NextResponse.json({ ok: true });
}
