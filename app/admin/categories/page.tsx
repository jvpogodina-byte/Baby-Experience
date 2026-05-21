import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Props = {
  searchParams: Promise<{ created?: string; deleted?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          items: true
        }
      }
    },
    orderBy: [{ order: "asc" }, { name: "asc" }]
  });

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="admin-page-header">
          <div>
            <span className="eyebrow">Категории</span>
            <h1 className="section-title">Управление категориями</h1>
          </div>
          <Link className="button" href="/admin/categories/new">
            Создать
          </Link>
        </div>

        {params.created ? <div className="form-message success">Категория создана.</div> : null}
        {params.deleted ? <div className="form-message success">Категория удалена.</div> : null}

        <section className="admin-panel">
          <div className="admin-list">
            {categories.length ? (
              categories.map((category) => (
                <Link key={category.id} className="admin-row" href={`/admin/categories/${category.id}`}>
                  <div>
                    <strong>{category.name}</strong>
                    <span className="subtle">/{category.slug}</span>
                  </div>
                  <div className="badge-row">
                    <span className="badge">order: {category.order}</span>
                    <span className="badge">вещей: {category._count.items}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="subtle">Категорий пока нет.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
