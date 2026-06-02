import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

function readLocalDatabaseUrl() {
  try {
    const env = readFileSync(".env", "utf8");
    const line = env
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith("DATABASE_URL="));

    return line
      ?.slice("DATABASE_URL=".length)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  } catch {
    return undefined;
  }
}

const sourceUrl = process.env.SOURCE_DATABASE_URL || readLocalDatabaseUrl();
const targetUrl = process.env.TARGET_DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  console.error("Set TARGET_DATABASE_URL before running this script. SOURCE_DATABASE_URL is optional and defaults to .env DATABASE_URL.");
  process.exit(1);
}

if (sourceUrl === targetUrl) {
  console.error("SOURCE_DATABASE_URL and TARGET_DATABASE_URL must point to different databases.");
  process.exit(1);
}

const source = new PrismaClient({
  datasources: {
    db: {
      url: sourceUrl
    }
  }
});

const target = new PrismaClient({
  datasources: {
    db: {
      url: targetUrl
    }
  }
});

function stripTimestamps(record) {
  const { createdAt, updatedAt, ...data } = record;
  return data;
}

async function importCategories() {
  const categories = await source.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }]
  });
  const idsBySourceId = new Map();

  for (const category of categories) {
    const imported = await target.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        hero: category.hero,
        accent: category.accent,
        order: category.order
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        hero: category.hero,
        accent: category.accent,
        order: category.order
      },
      select: {
        id: true
      }
    });

    idsBySourceId.set(category.id, imported.id);
  }

  return { count: categories.length, idsBySourceId };
}

async function importItems(categoryIdsBySourceId) {
  const items = await source.item.findMany({
    include: {
      categories: true,
      examples: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  for (const item of items) {
    const imported = await target.item.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        previewImageUrl: item.previewImageUrl,
        featured: item.featured,
        status: item.status
      },
      create: {
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        previewImageUrl: item.previewImageUrl,
        featured: item.featured,
        status: item.status
      },
      select: {
        id: true
      }
    });

    await target.itemCategory.deleteMany({
      where: { itemId: imported.id }
    });

    const categoryLinks = item.categories.flatMap((link) => {
      const categoryId = categoryIdsBySourceId.get(link.categoryId);
      return categoryId
        ? [
            {
              itemId: imported.id,
              categoryId,
              order: link.order ?? 0
            }
          ]
        : [];
    });

    if (categoryLinks.length) {
      await target.itemCategory.createMany({
        data: categoryLinks,
        skipDuplicates: true
      });
    }

    await target.itemExample.deleteMany({
      where: { itemId: imported.id }
    });

    if (item.examples.length) {
      await target.itemExample.createMany({
        data: item.examples.map((example) => ({
          id: example.id,
          itemId: imported.id,
          kind: example.kind,
          label: example.label,
          url: example.url,
          imageUrl: example.imageUrl,
          caption: example.caption
        })),
        skipDuplicates: true
      });
    }
  }

  return items.length;
}

async function importMediaAssets() {
  const mediaAssets = await source.mediaAsset.findMany({
    orderBy: { createdAt: "asc" }
  });

  for (const asset of mediaAssets) {
    const data = stripTimestamps(asset);

    await target.mediaAsset.upsert({
      where: { id: asset.id },
      update: {
        url: data.url,
        alt: data.alt,
        kind: data.kind,
        width: data.width,
        height: data.height,
        uploadedById: null
      },
      create: {
        id: data.id,
        url: data.url,
        alt: data.alt,
        kind: data.kind,
        width: data.width,
        height: data.height,
        uploadedById: null
      }
    });
  }

  return mediaAssets.length;
}

async function main() {
  const { count: categoryCount, idsBySourceId } = await importCategories();
  const itemCount = await importItems(idsBySourceId);
  const mediaCount = await importMediaAssets();

  const publishedCount = await target.item.count({ where: { status: "PUBLISHED" } });
  const examplesWithLinks = await target.itemExample.count({ where: { url: { not: null } } });
  const examplesWithImages = await target.itemExample.count({ where: { imageUrl: { not: null } } });

  console.log(
    JSON.stringify(
      {
        importedCategories: categoryCount,
        importedItems: itemCount,
        importedMediaAssets: mediaCount,
        targetPublishedItems: publishedCount,
        targetExamplesWithLinks: examplesWithLinks,
        targetExamplesWithImages: examplesWithImages
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
