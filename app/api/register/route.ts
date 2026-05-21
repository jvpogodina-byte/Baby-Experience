import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  if (!MVP_USER_FEATURES.publicRegistration) {
    return badRequest("Публичная регистрация временно недоступна.", 404);
  }

  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return badRequest("Некорректный формат запроса.");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!emailPattern.test(email)) {
    return badRequest("Введите корректный email.");
  }

  if (password.length < 8) {
    return badRequest("Пароль должен быть не короче 8 символов.");
  }

  if (password.length > 128) {
    return badRequest("Пароль должен быть не длиннее 128 символов.");
  }

  if (name.length > 80) {
    return badRequest("Имя должно быть не длиннее 80 символов.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    return badRequest("Пользователь с таким email уже существует.", 409);
  }

  const passwordHash = await hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        role: "USER"
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return badRequest("Пользователь с таким email уже существует.", 409);
    }

    throw error;
  }
}
