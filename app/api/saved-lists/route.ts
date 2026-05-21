import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";
import { getSavedListsForUser, mapSavedList, savedListInclude } from "@/lib/saved-lists";

const MAX_LIST_NAME_LENGTH = 80;
const MAX_LIST_DESCRIPTION_LENGTH = 240;

type CreateSavedListBody = {
  name?: unknown;
  description?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function GET() {
  if (!MVP_USER_FEATURES.savedLists) {
    return jsonError("Сохранённые списки временно недоступны.", 404);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Войдите, чтобы открыть сохранённые списки.", 401);
  }

  const lists = await getSavedListsForUser(session.user.id);
  return NextResponse.json({ lists });
}

export async function POST(request: Request) {
  if (!MVP_USER_FEATURES.savedLists) {
    return jsonError("Сохранённые списки временно недоступны.", 404);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Войдите, чтобы создать список.", 401);
  }

  let payload: CreateSavedListBody;

  try {
    payload = (await request.json()) as CreateSavedListBody;
  } catch {
    return jsonError("Некорректный формат запроса.");
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";

  if (!name) {
    return jsonError("Название списка не может быть пустым.");
  }

  if (name.length > MAX_LIST_NAME_LENGTH) {
    return jsonError(`Название списка должно быть не длиннее ${MAX_LIST_NAME_LENGTH} символов.`);
  }

  if (description.length > MAX_LIST_DESCRIPTION_LENGTH) {
    return jsonError(`Описание списка должно быть не длиннее ${MAX_LIST_DESCRIPTION_LENGTH} символов.`);
  }

  const list = await prisma.savedList.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null
    },
    include: savedListInclude
  });

  return NextResponse.json({ list: mapSavedList(list) }, { status: 201 });
}
