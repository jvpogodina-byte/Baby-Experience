import { prisma } from "@/lib/db";

export const analyticsCookieName = "bx_visitor";

export async function getAnalyticsOverview() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalViews, uniqueVisitors, viewsLast7Days, uniqueVisitorsLast7Days, topPages, topCategories] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.groupBy({ by: ["visitorId"] }).then((rows) => rows.length),
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.pageView.groupBy({ by: ["visitorId"], where: { createdAt: { gte: since } } }).then((rows) => rows.length),
    prisma.$queryRaw<Array<{ path: string; routeLabel: string | null; views: bigint; visitors: bigint }>>`
      SELECT "path", MAX("routeLabel") AS "routeLabel", COUNT(*) AS "views", COUNT(DISTINCT "visitorId") AS "visitors"
      FROM "PageView"
      GROUP BY "path"
      ORDER BY COUNT(*) DESC, MAX("createdAt") DESC
      LIMIT 10
    `,
    prisma.$queryRaw<Array<{ routeSlug: string | null; routeLabel: string | null; views: bigint; visitors: bigint }>>`
      SELECT "routeSlug", MAX("routeLabel") AS "routeLabel", COUNT(*) AS "views", COUNT(DISTINCT "visitorId") AS "visitors"
      FROM "PageView"
      WHERE "routeType" = 'category'
      GROUP BY "routeSlug"
      ORDER BY COUNT(*) DESC, MAX("createdAt") DESC
      LIMIT 10
    `
  ]);

  const categoryNames = new Map(
    (
      await prisma.category.findMany({
        select: {
          slug: true,
          name: true
        }
      })
    ).map((category) => [category.slug, category.name])
  );

  return {
    totalViews,
    uniqueVisitors,
    viewsLast7Days,
    uniqueVisitorsLast7Days,
    topPages: topPages.map((row) => ({
      path: row.path,
      label: row.routeLabel ?? row.path,
      views: Number(row.views),
      visitors: Number(row.visitors)
    })),
    topCategories: topCategories.map((row) => ({
      slug: row.routeSlug ?? "",
      label: (row.routeSlug && categoryNames.get(row.routeSlug)) || row.routeLabel || row.routeSlug || "Без названия",
      views: Number(row.views),
      visitors: Number(row.visitors)
    }))
  };
}
