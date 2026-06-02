import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryItemOrderForm } from "@/components/admin/category-item-order-form";
import { CategoryForm, DeleteCategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ order?: string; saved?: string }>;
};

export default async function EditCategoryPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          item: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              previewImageUrl: true
            }
          }
        },
        orderBy: [{ order: "asc" }, { item: { title: "asc" } }]
      },
      _count: {
        select: {
          items: true
        }
      }
    }
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="detail-hero">
      <div className="container admin-narrow">
        <Link className="button secondary" href="/admin/categories">
          Назад к категориям
        </Link>
        {query.saved ? <div className="form-message success">Категория сохранена.</div> : null}
        {query.order ? <div className="form-message success">Порядок товаров сохранён.</div> : null}
        <section className="admin-panel">
          <span className="eyebrow">Редактирование</span>
          <h1 className="section-title">{category.name}</h1>
          <CategoryForm key={category.id} category={category} />
        </section>

        <section className="admin-panel">
          <span className="eyebrow">Публичный порядок</span>
          <h2>Порядок товаров в категории</h2>
          <p className="subtle">
            Перетащите товары в нужной последовательности. Именно так они будут показаны на публичной странице
            категории.
          </p>
          <CategoryItemOrderForm
            categoryId={category.id}
            items={category.items.map(({ item }) => ({
              id: item.id,
              title: item.title,
              slug: item.slug,
              status: item.status,
              previewImageUrl: item.previewImageUrl
            }))}
          />
        </section>

        <section className="admin-panel">
          <h2>Удаление</h2>
          <p>
            Категорию можно удалить только если к ней не привязаны вещи. Сейчас привязано:
            {" "}
            {category._count.items}.
          </p>
          <DeleteCategoryForm id={category.id} />
        </section>
      </div>
    </main>
  );
}
