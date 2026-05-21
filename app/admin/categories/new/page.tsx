import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/admin";

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <main className="detail-hero">
      <div className="container admin-narrow">
        <Link className="button secondary" href="/admin/categories">
          Назад к категориям
        </Link>
        <section className="admin-panel">
          <span className="eyebrow">Новая категория</span>
          <h1 className="section-title">Создать категорию</h1>
          <CategoryForm key="new-category" />
        </section>
      </div>
    </main>
  );
}
