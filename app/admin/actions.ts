"use server";

import { ExampleKind, Prisma, PublishStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export type AdminActionState = {
  message?: string;
  errors?: Record<string, string>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statuses = new Set<string>(Object.values(PublishStatus));
const exampleKinds = new Set<string>(Object.values(ExampleKind));

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

function readInteger(formData: FormData, key: string) {
  const value = readString(formData, key);
  const parsed = Number.parseInt(value || "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readSelectedIds(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function validateSlug(slug: string, errors: Record<string, string>) {
  if (!slug) {
    errors.slug = "Укажите slug.";
  } else if (!slugPattern.test(slug)) {
    errors.slug = "Slug может содержать только латинские буквы, цифры и дефисы.";
  }
}

function uniqueErrorMessage(error: unknown, label: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return `${label} с таким slug уже существует.`;
  }

  return null;
}

async function ensureCategorySlugIsUnique(slug: string, currentId?: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true }
  });

  return !category || category.id === currentId;
}

async function ensureItemSlugIsUnique(slug: string, currentId?: string) {
  const item = await prisma.item.findUnique({
    where: { slug },
    select: { id: true }
  });

  return !item || item.id === currentId;
}

function readCategoryPayload(formData: FormData) {
  const errors: Record<string, string> = {};
  const name = readString(formData, "name");
  const slugInput = readString(formData, "slug");
  const slug = slugify(slugInput || name);
  const description = readString(formData, "description");
  const hero = readString(formData, "hero");
  const accent = readString(formData, "accent") || "sand";
  const order = readInteger(formData, "order");

  if (!name) {
    errors.name = "Укажите название категории.";
  }
  validateSlug(slug, errors);
  if (!description) {
    errors.description = "Добавьте описание категории.";
  }

  return {
    data: { name, slug, description, hero, accent, order },
    errors
  };
}

export async function createCategoryAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const { data, errors } = readCategoryPayload(formData);
  if (Object.keys(errors).length) {
    return { errors, message: "Проверьте поля категории." };
  }

  if (!(await ensureCategorySlugIsUnique(data.slug))) {
    return { errors: { slug: "Категория с таким slug уже существует." }, message: "Проверьте slug." };
  }

  try {
    await prisma.category.create({ data });
  } catch (error) {
    return { message: uniqueErrorMessage(error, "Категория") ?? "Не удалось создать категорию." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?created=1");
}

export async function updateCategoryAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const id = readString(formData, "id");
  const { data, errors } = readCategoryPayload(formData);
  if (!id) {
    return { message: "Категория не найдена." };
  }
  if (Object.keys(errors).length) {
    return { errors, message: "Проверьте поля категории." };
  }

  if (!(await ensureCategorySlugIsUnique(data.slug, id))) {
    return { errors: { slug: "Категория с таким slug уже существует." }, message: "Проверьте slug." };
  }

  try {
    await prisma.category.update({
      where: { id },
      data
    });
  } catch (error) {
    return { message: uniqueErrorMessage(error, "Категория") ?? "Не удалось сохранить категорию." };
  }

  revalidatePath("/");
  revalidatePath(`/categories/${data.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  redirect(`/admin/categories/${id}?saved=1`);
}

export async function deleteCategoryAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const id = readString(formData, "id");
  if (!id) {
    return { message: "Категория не найдена." };
  }

  const itemCount = await prisma.itemCategory.count({
    where: { categoryId: id }
  });

  if (itemCount > 0) {
    return { message: "Нельзя удалить категорию, пока к ней привязаны вещи." };
  }

  await prisma.category.delete({
    where: { id }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?deleted=1");
}

function readItemPayload(formData: FormData, defaultStatus: PublishStatus) {
  const errors: Record<string, string> = {};
  const title = readString(formData, "title");
  const slugInput = readString(formData, "slug");
  const slug = slugify(slugInput || title);
  const summary = readString(formData, "summary");
  const previewImageUrl = readOptionalString(formData, "previewImageUrl");
  const featured = formData.get("featured") === "on";
  const categoryIds = readSelectedIds(formData, "categoryIds");
  const requestedStatus = readString(formData, "statusIntent") || readString(formData, "status");
  const status = statuses.has(requestedStatus) ? (requestedStatus as PublishStatus) : defaultStatus;

  if (!title) {
    errors.title = "Укажите название вещи.";
  }
  validateSlug(slug, errors);
  if (!summary) {
    errors.summary = "Добавьте описание.";
  }
  if (!categoryIds.length) {
    errors.categoryIds = "Выберите хотя бы одну категорию.";
  }

  return {
    data: {
      title,
      slug,
      summary,
      previewImageUrl,
      featured,
      status
    },
    categoryIds,
    errors
  };
}

export async function createItemAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const { data, categoryIds, errors } = readItemPayload(formData, PublishStatus.DRAFT);
  data.status = PublishStatus.DRAFT;

  if (Object.keys(errors).length) {
    return { errors, message: "Проверьте поля вещи." };
  }

  if (!(await ensureItemSlugIsUnique(data.slug))) {
    return { errors: { slug: "Вещь с таким slug уже существует." }, message: "Проверьте slug." };
  }

  let itemId = "";

  try {
    const item = await prisma.item.create({
      data: {
        ...data,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId }))
        }
      },
      select: { id: true }
    });
    itemId = item.id;
  } catch (error) {
    return { message: uniqueErrorMessage(error, "Вещь") ?? "Не удалось создать вещь." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/items");
  redirect(`/admin/items/${itemId}?created=1`);
}

export async function updateItemAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const id = readString(formData, "id");
  const { data, categoryIds, errors } = readItemPayload(formData, PublishStatus.DRAFT);
  if (!id) {
    return { message: "Вещь не найдена." };
  }
  if (Object.keys(errors).length) {
    return { errors, message: "Проверьте поля вещи." };
  }

  if (!(await ensureItemSlugIsUnique(data.slug, id))) {
    return { errors: { slug: "Вещь с таким slug уже существует." }, message: "Проверьте slug." };
  }

  try {
    await prisma.item.update({
      where: { id },
      data: {
        ...data,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId }))
        }
      }
    });
  } catch (error) {
    return { message: uniqueErrorMessage(error, "Вещь") ?? "Не удалось сохранить вещь." };
  }

  revalidatePath("/");
  revalidatePath(`/items/${data.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/items");
  redirect(`/admin/items/${id}?saved=1`);
}

export async function deleteItemAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const id = readString(formData, "id");
  if (!id) {
    return { message: "Вещь не найдена." };
  }

  await prisma.item.delete({
    where: { id }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/items");
  redirect("/admin/items?deleted=1");
}

function readExamplePayload(formData: FormData) {
  const errors: Record<string, string> = {};
  const label = readString(formData, "label");
  const kindValue = readString(formData, "kind");
  const kind = exampleKinds.has(kindValue) ? (kindValue as ExampleKind) : ExampleKind.LINK;
  const url = readOptionalString(formData, "url");
  const imageUrl = readOptionalString(formData, "imageUrl");
  const caption = readOptionalString(formData, "caption");

  if (!label) {
    errors.label = "Укажите подпись примера.";
  }
  if ((kind === ExampleKind.LINK || kind === ExampleKind.BOTH) && !url) {
    errors.url = "Для LINK и BOTH нужна ссылка.";
  }
  if ((kind === ExampleKind.IMAGE || kind === ExampleKind.BOTH) && !imageUrl) {
    errors.imageUrl = "Для IMAGE и BOTH нужен URL изображения.";
  }

  return {
    data: { label, kind, url, imageUrl, caption },
    errors
  };
}

export async function createExampleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const itemId = readString(formData, "itemId");
  const { data, errors } = readExamplePayload(formData);
  if (!itemId) {
    return { message: "Вещь не найдена." };
  }
  if (Object.keys(errors).length) {
    return { errors, message: "Проверьте поля примера." };
  }

  await prisma.itemExample.create({
    data: {
      ...data,
      itemId
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/items");
  redirect(`/admin/items/${itemId}?example=created`);
}

export async function updateExampleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const id = readString(formData, "id");
  const itemId = readString(formData, "itemId");
  const { data, errors } = readExamplePayload(formData);
  if (!id || !itemId) {
    return { message: "Пример не найден." };
  }
  if (Object.keys(errors).length) {
    return { errors, message: "Проверьте поля примера." };
  }

  await prisma.itemExample.update({
    where: { id },
    data
  });

  revalidatePath("/");
  revalidatePath("/admin/items");
  redirect(`/admin/items/${itemId}?example=saved`);
}

export async function deleteExampleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();

  const id = readString(formData, "id");
  const itemId = readString(formData, "itemId");
  if (!id || !itemId) {
    return { message: "Пример не найден." };
  }

  await prisma.itemExample.delete({
    where: { id }
  });

  revalidatePath("/");
  revalidatePath("/admin/items");
  redirect(`/admin/items/${itemId}?example=deleted`);
}
