import { ExampleKind, Prisma, PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";
import {
  categories as fallbackCategories,
  featuredItems as fallbackFeaturedItems,
  getCategoryBySlug as getFallbackCategoryBySlug,
  getItemBySlug as getFallbackItemBySlug,
  getItemsForCategory as getFallbackItemsForCategory,
  getRelatedItems as getFallbackRelatedItems,
  type Category as FallbackCategory,
  type Item as FallbackItem
} from "@/lib/content";

export type CatalogCategory = {
  slug: string;
  name: string;
  description: string;
  accent: string;
  hero: string;
};

export type CatalogItemCategory = Pick<CatalogCategory, "slug" | "name">;

export type CatalogItemExample = {
  id: string;
  label: string;
  kind: "link" | "image" | "both";
  url?: string;
  imageUrl?: string;
  caption?: string;
};

export type CatalogComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type CatalogItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  previewImageUrl?: string;
  categorySlugs: string[];
  categoryOrders: Record<string, number>;
  categories: CatalogItemCategory[];
  featured: boolean;
  examples: CatalogItemExample[];
  example?: CatalogItemExample;
  comments: CatalogComment[];
};

const catalogItemInclude = Prisma.validator<Prisma.ItemInclude>()({
  categories: {
    include: {
      category: true
    }
  },
  examples: {
    orderBy: {
      createdAt: "asc"
    }
  },
  comments: {
    where: {
      isHidden: false
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  }
});

type CatalogItemRecord = Prisma.ItemGetPayload<{ include: typeof catalogItemInclude }>;

const commentDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

let warnedAboutFallback = false;

function logFallback(error: unknown) {
  if (warnedAboutFallback) {
    return;
  }

  warnedAboutFallback = true;
  console.warn("Catalog fallback enabled because the database is unavailable.", error);
}

async function withCatalogFallback<T>(query: () => Promise<T>, fallback: () => T | Promise<T>) {
  try {
    return await query();
  } catch (error) {
    logFallback(error);
    return fallback();
  }
}

function mapCategory(category: {
  slug: string;
  name: string;
  description: string;
  accent: string;
  hero: string;
}): CatalogCategory {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    accent: category.accent,
    hero: category.hero
  };
}

function mapFallbackCategory(category: FallbackCategory): CatalogCategory {
  return mapCategory(category);
}

function mapExampleKind(kind: ExampleKind): CatalogItemExample["kind"] {
  switch (kind) {
    case ExampleKind.IMAGE:
      return "image";
    case ExampleKind.BOTH:
      return "both";
    case ExampleKind.LINK:
    default:
      return "link";
  }
}

function mapItem(item: CatalogItemRecord): CatalogItem {
  const categories = item.categories
    .sort((first, second) => first.category.order - second.category.order)
    .map(({ category }) => ({
      slug: category.slug,
      name: category.name
    }));
  const categoryOrders = Object.fromEntries(item.categories.map(({ category, order }) => [category.slug, order]));

  const examples = item.examples.map((example) => ({
    id: example.id,
    label: example.label,
    kind: mapExampleKind(example.kind),
    url: example.url ?? undefined,
    imageUrl: example.imageUrl ?? undefined,
    caption: example.caption ?? undefined
  }));

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    previewImageUrl: item.previewImageUrl ?? undefined,
    categorySlugs: categories.map((category) => category.slug),
    categoryOrders,
    categories,
    featured: item.featured,
    examples,
    example: examples[0],
    comments: MVP_USER_FEATURES.comments
      ? item.comments.map((comment) => ({
          id: comment.id,
          author: comment.user.name ?? comment.user.email ?? "Пользователь",
          body: comment.body,
          createdAt: commentDateFormatter.format(comment.createdAt)
        }))
      : []
  };
}

function mapFallbackItem(item: FallbackItem): CatalogItem {
  const categories = item.categorySlugs
    .map((slug) => getFallbackCategoryBySlug(slug))
    .filter((category): category is FallbackCategory => Boolean(category))
    .map((category) => ({
      slug: category.slug,
      name: category.name
    }));

  const sourceExamples = item.examples?.length ? item.examples : [item.example];
  const examples = sourceExamples.map((example, index) => ({
    id: `fallback-example-${item.slug}-${index + 1}`,
    label: example.label,
    kind: example.kind,
    url: example.url,
    imageUrl: example.imageUrl,
    caption: example.caption
  }));
  const example = examples[0];

  return {
    id: `fallback-item-${item.slug}`,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    previewImageUrl: item.previewImageUrl ?? item.example.imageUrl,
    categorySlugs: item.categorySlugs,
    categoryOrders: Object.fromEntries(item.categorySlugs.map((slug, index) => [slug, index])),
    categories,
    featured: Boolean(item.featured),
    examples,
    example,
    comments: MVP_USER_FEATURES.comments
      ? item.comments.map((comment, index) => ({
          id: `fallback-comment-${item.slug}-${index + 1}`,
          author: comment.author,
          body: comment.body,
          createdAt: comment.createdAt
        }))
      : []
  };
}

export async function getCategoriesForHome() {
  return withCatalogFallback(
    async () => {
      const categories = await prisma.category.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }]
      });

      return categories.map(mapCategory);
    },
    () => fallbackCategories.map(mapFallbackCategory)
  );
}

export async function getFeaturedPublishedItems() {
  return withCatalogFallback(
    async () => {
      const items = await prisma.item.findMany({
        where: {
          featured: true,
          status: PublishStatus.PUBLISHED
        },
        include: catalogItemInclude,
        orderBy: [{ updatedAt: "desc" }, { title: "asc" }]
      });

      return items.map(mapItem);
    },
    () => fallbackFeaturedItems.map(mapFallbackItem)
  );
}

export async function getCategoryBySlug(slug: string) {
  return withCatalogFallback(
    async () => {
      const category = await prisma.category.findUnique({
        where: {
          slug
        }
      });

      return category ? mapCategory(category) : null;
    },
    () => {
      const category = getFallbackCategoryBySlug(slug);
      return category ? mapFallbackCategory(category) : null;
    }
  );
}

export async function getPublishedItemsForCategory(slug: string) {
  return withCatalogFallback(
    async () => {
      const items = await prisma.item.findMany({
        where: {
          status: PublishStatus.PUBLISHED,
          categories: {
            some: {
              category: {
                slug
              }
            }
          }
        },
        include: catalogItemInclude,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }, { title: "asc" }]
      });

      return items.map(mapItem);
    },
    () => getFallbackItemsForCategory(slug).map(mapFallbackItem)
  );
}

export async function getPublishedItems() {
  return withCatalogFallback(
    async () => {
      const items = await prisma.item.findMany({
        where: {
          status: PublishStatus.PUBLISHED
        },
        include: catalogItemInclude,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }, { title: "asc" }]
      });

      return items.map(mapItem);
    },
    () => {
      const itemsBySlug = new Map<string, FallbackItem>();

      for (const category of fallbackCategories) {
        for (const item of getFallbackItemsForCategory(category.slug)) {
          itemsBySlug.set(item.slug, item);
        }
      }

      return Array.from(itemsBySlug.values()).map(mapFallbackItem);
    }
  );
}

export async function getPublishedItemBySlug(slug: string) {
  return withCatalogFallback(
    async () => {
      const item = await prisma.item.findFirst({
        where: {
          slug,
          status: PublishStatus.PUBLISHED
        },
        include: catalogItemInclude
      });

      return item ? mapItem(item) : null;
    },
    () => {
      const item = getFallbackItemBySlug(slug);
      return item ? mapFallbackItem(item) : null;
    }
  );
}

export async function getRelatedPublishedItems(itemSlug: string) {
  return withCatalogFallback(
    async () => {
      const currentItem = await prisma.item.findFirst({
        where: {
          slug: itemSlug,
          status: PublishStatus.PUBLISHED
        },
        select: {
          categories: {
            select: {
              categoryId: true,
              category: {
                select: {
                  slug: true
                }
              }
            }
          }
        }
      });

      if (!currentItem) {
        return [];
      }

      const categoryIds = currentItem.categories.map((category) => category.categoryId);
      const categorySlugs = currentItem.categories.map((category) => category.category.slug);

      if (!categoryIds.length) {
        return [];
      }

      const items = await prisma.item.findMany({
        where: {
          slug: {
            not: itemSlug
          },
          status: PublishStatus.PUBLISHED,
          categories: {
            some: {
              categoryId: {
                in: categoryIds
              }
            }
          }
        },
        include: catalogItemInclude
      });

      return items
        .map(mapItem)
        .map((item) => ({
          item,
          score: item.categorySlugs.filter((slug) => categorySlugs.includes(slug)).length
        }))
        .sort((first, second) => second.score - first.score || first.item.title.localeCompare(second.item.title, "ru"))
        .slice(0, 3)
        .map(({ item }) => item);
    },
    () => getFallbackRelatedItems(itemSlug).map(mapFallbackItem)
  );
}
