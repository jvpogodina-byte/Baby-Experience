import Link from "next/link";
import { ItemForm } from "@/components/admin/item-form";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function NewItemPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: [{ order: "asc" }, { name: "asc" }]
  });

  return (
    <main className="detail-hero">
      <div className="container">
        <Link className="button secondary" href="/admin/items">
          Назад к вещам
        </Link>
        <section className="admin-panel">
          <span className="eyebrow">Новая вещь</span>
          <h1 className="section-title">Создать вещь</h1>
          <ItemForm key="new-item" categories={categories} />
        </section>
      </div>
    </main>
  );
}
