ALTER TABLE "ItemCategory" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

WITH ranked_links AS (
  SELECT
    "ItemCategory"."itemId",
    "ItemCategory"."categoryId",
    ROW_NUMBER() OVER (
      PARTITION BY "ItemCategory"."categoryId"
      ORDER BY "Item"."featured" DESC, "Item"."updatedAt" DESC, "Item"."title" ASC
    ) - 1 AS row_order
  FROM "ItemCategory"
  INNER JOIN "Item" ON "Item"."id" = "ItemCategory"."itemId"
)
UPDATE "ItemCategory"
SET "order" = ranked_links.row_order
FROM ranked_links
WHERE
  "ItemCategory"."itemId" = ranked_links."itemId"
  AND "ItemCategory"."categoryId" = ranked_links."categoryId";
