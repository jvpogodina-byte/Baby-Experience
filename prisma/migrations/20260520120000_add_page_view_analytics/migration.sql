CREATE TABLE "PageView" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "routeType" TEXT NOT NULL,
  "routeSlug" TEXT,
  "routeLabel" TEXT,
  "visitorId" TEXT NOT NULL,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");
CREATE INDEX "PageView_routeType_routeSlug_idx" ON "PageView"("routeType", "routeSlug");
CREATE INDEX "PageView_visitorId_createdAt_idx" ON "PageView"("visitorId", "createdAt");

ALTER TABLE "PageView"
ADD CONSTRAINT "PageView_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
