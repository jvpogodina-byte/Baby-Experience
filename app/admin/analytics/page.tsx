import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getAnalyticsOverview } from "@/lib/analytics";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const analytics = await getAnalyticsOverview();

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="admin-page-header">
          <div>
            <span className="eyebrow">Аналитика</span>
            <h1 className="section-title">Просмотры и интерес к разделам</h1>
            <p className="section-copy">
              Здесь видно, сколько раз открывали публичные страницы и какие подборки вызывают больше интереса.
            </p>
          </div>
        </div>

        <div className="admin-stats">
          <section className="metric admin-stat">
            <strong>{analytics.totalViews}</strong>
            <span>всего просмотров страниц</span>
          </section>
          <section className="metric admin-stat">
            <strong>{analytics.uniqueVisitors}</strong>
            <span>уникальных посетителей</span>
          </section>
          <section className="metric admin-stat">
            <strong>{analytics.viewsLast7Days}</strong>
            <span>просмотров за 7 дней</span>
          </section>
          <section className="metric admin-stat">
            <strong>{analytics.uniqueVisitorsLast7Days}</strong>
            <span>уникальных за 7 дней</span>
          </section>
        </div>

        <div className="admin-columns">
          <section className="admin-panel">
            <h2>Популярные страницы</h2>
            <div className="admin-list">
              {analytics.topPages.length ? (
                analytics.topPages.map((page) => (
                  <div key={page.path} className="admin-row">
                    <div>
                      <strong>{page.label}</strong>
                      <span className="subtle">{page.path}</span>
                    </div>
                    <div className="subtle">
                      {page.views} просмотров · {page.visitors} посетителей
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Пока нет данных по просмотрам.</div>
              )}
            </div>
          </section>

          <section className="admin-panel">
            <h2>Самые интересные подборки</h2>
            <div className="admin-list">
              {analytics.topCategories.length ? (
                analytics.topCategories.map((category) => (
                  <Link key={category.slug} className="admin-row" href={`/categories/${category.slug}`}>
                    <div>
                      <strong>{category.label}</strong>
                      <span className="subtle">/categories/{category.slug}</span>
                    </div>
                    <div className="subtle">
                      {category.views} просмотров · {category.visitors} посетителей
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">Когда пользователи начнут открывать подборки, статистика появится здесь.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
