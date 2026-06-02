import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Props = {
  searchParams: Promise<{ deleted?: string }>;
};

export default async function AdminItemsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const items = await prisma.item.findMany({
    include: {
      categories: {
        include: {
          category: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          examples: true,
          comments: true
        }
      }
    },
    orderBy: { title: "asc" }
  });

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="admin-page-header">
          <div>
            <span className="eyebrow">Вещи</span>
            <h1 className="section-title">Управление вещами</h1>
          </div>
          <Link className="button" href="/admin/items/new">
            Создать
          </Link>
        </div>

        {params.deleted ? <div className="form-message success">Вещь удалена.</div> : null}

        <section className="admin-panel">
          <div className="admin-list">
            {items.length ? (
              items.map((item) => (
                <Link key={item.id} className="admin-row" href={`/admin/items/${item.id}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <span className="subtle">/{item.slug}</span>
                    <div className="subtle">
                      {item.categories.map(({ category }) => category.name).join(", ") || "Без категории"}
                    </div>
                  </div>
                  <div className="badge-row">
                    <span className="badge">{item.status}</span>
                    <span className="badge">примеров: {item._count.examples}</span>
                    <span className="badge">комментариев: {item._count.comments}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="subtle">Вещей пока нет.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
