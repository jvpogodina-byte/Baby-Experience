import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SavedListItemView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string;
};

export type SavedListView = {
  id: string;
  name: string;
  description?: string;
  items: SavedListItemView[];
  createdAt: string;
  updatedAt: string;
};

export const savedListInclude = Prisma.validator<Prisma.SavedListInclude>()({
  items: {
    include: {
      item: {
        include: {
          examples: {
            orderBy: {
              createdAt: "asc"
            },
            take: 1
          }
        }
      }
    }
  }
});

type SavedListRecord = Prisma.SavedListGetPayload<{ include: typeof savedListInclude }>;

export function mapSavedList(list: SavedListRecord): SavedListView {
  return {
    id: list.id,
    name: list.name,
    description: list.description ?? undefined,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    items: list.items
      .map(({ item }) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        imageUrl: item.examples[0]?.imageUrl ?? undefined
      }))
      .sort((first, second) => first.title.localeCompare(second.title, "ru"))
  };
}

export async function getSavedListsForUser(userId: string) {
  const lists = await prisma.savedList.findMany({
    where: {
      userId
    },
    include: savedListInclude,
    orderBy: [
      {
        updatedAt: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  return lists.map(mapSavedList);
}
