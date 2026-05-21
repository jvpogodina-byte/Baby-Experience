import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAdmin } from "@/lib/admin";
import { getAnalyticsOverview } from "@/lib/analytics";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const session = await requireAdmin();
  const user = session.user;
  const [categoryCount, itemCount, draftCount, archivedCount, commentCount, hiddenCommentCount, analytics] = await Promise.all([
    prisma.category.count(),
    prisma.item.count(),
    prisma.item.count({ where: { status: "DRAFT" } }),
    prisma.item.count({ where: { status: "ARCHIVED" } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { isHidden: true } }),
    getAnalyticsOverview()
  ]);

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="detail-header">
          <span className="eyebrow">Админка</span>
          <h1 className="section-title">Контент, публикация и модерация</h1>
          <p className="section-copy">
            Вы вошли как администратор {user.name || user.email}. Здесь можно наполнить каталог без
            редактирования кода.
          </p>
          <div className="badge-row">
            <span className="badge">{user.email}</span>
            <span className="badge">Роль: {user.role}</span>
            <SignOutButton />
          </div>
        </div>

        <div className="admin-stats">
          <Link className="metric admin-stat" href="/admin/categories">
            <strong>{categoryCount}</strong>
            <span>категорий</span>
          </Link>
          <Link className="metric admin-stat" href="/admin/items">
            <strong>{itemCount}</strong>
            <span>вещей всего</span>
          </Link>
          <Link className="metric admin-stat" href="/admin/items">
            <strong>{draftCount}</strong>
            <span>черновиков</span>
          </Link>
          <Link className="metric admin-stat" href="/admin/items">
            <strong>{archivedCount}</strong>
            <span>в архиве</span>
          </Link>
          <Link className="metric admin-stat" href="/admin/comments">
            <strong>{commentCount}</strong>
            <span>комментариев, скрыто: {hiddenCommentCount}</span>
          </Link>
        </div>

        <div className="admin-columns">
          <Link className="admin-panel admin-link-panel" href="/admin/analytics">
            <h2>Аналитика</h2>
            <p>
              {analytics.totalViews} просмотров страниц и {analytics.uniqueVisitors} уникальных посетителей.
            </p>
          </Link>
          <Link className="admin-panel admin-link-panel" href="/admin/categories/new">
            <h2>Создать категорию</h2>
            <p>Добавить раздел каталога и настроить порядок на главной.</p>
          </Link>
          <Link className="admin-panel admin-link-panel" href="/admin/items/new">
            <h2>Создать вещь</h2>
            <p>Новая вещь появится как DRAFT, пока админ не опубликует её.</p>
          </Link>
          <Link className="admin-panel admin-link-panel" href="/admin/comments">
            <h2>Модерировать комментарии</h2>
            <p>Скрывать и возвращать комментарии без удаления из базы.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
