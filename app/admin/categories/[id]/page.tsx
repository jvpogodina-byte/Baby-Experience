import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm, DeleteCategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditCategoryPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
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
        <section className="admin-panel">
          <span className="eyebrow">Редактирование</span>
          <h1 className="section-title">{category.name}</h1>
          <CategoryForm key={category.id} category={category} />
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
