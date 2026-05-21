-- AlterTable
ALTER TABLE "Item" ADD COLUMN "previewImageUrl" TEXT;

-- Backfill existing preview images from the first available image example
UPDATE "Item"
SET "previewImageUrl" = source."imageUrl"
FROM (
  SELECT DISTINCT ON ("itemId") "itemId", "imageUrl"
  FROM "ItemExample"
  WHERE "imageUrl" IS NOT NULL
  ORDER BY "itemId", "createdAt" ASC
) AS source
WHERE "Item"."id" = source."itemId"
  AND "Item"."previewImageUrl" IS NULL;
