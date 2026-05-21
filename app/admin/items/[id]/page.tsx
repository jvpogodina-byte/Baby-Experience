import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemExamplesEditor } from "@/components/admin/example-forms";
import { DeleteItemForm, ItemForm } from "@/components/admin/item-form";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string; example?: string }>;
};

function exampleMessage(value?: string) {
  switch (value) {
    case "created":
      return "Пример создан.";
    case "saved":
      return "Пример сохранён.";
    case "deleted":
      return "Пример удалён.";
    default:
      return "";
  }
}

export default async function EditItemPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, categories] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            categoryId: true
          }
        },
        examples: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: [{ order: "asc" }, { name: "asc" }]
    })
  ]);

  if (!item) {
    notFound();
  }

  const itemFormData = {
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    previewImageUrl: item.previewImageUrl ?? "",
    featured: item.featured,
    status: item.status,
    categoryIds: item.categories.map((category) => category.categoryId)
  };
  const examples = item.examples.map((example) => ({
    id: example.id,
    label: example.label,
    kind: example.kind,
    url: example.url ?? "",
    imageUrl: example.imageUrl ?? "",
    caption: example.caption ?? ""
  }));
  const currentExampleMessage = exampleMessage(query.example);

  return (
    <main className="detail-hero">
      <div className="container">
        <Link className="button secondary" href="/admin/items">
          Назад к вещам
        </Link>

        {query.created ? <div className="form-message success">Вещь создана как DRAFT.</div> : null}
        {query.saved ? <div className="form-message success">Вещь сохранена.</div> : null}
        {currentExampleMessage ? <div className="form-message success">{currentExampleMessage}</div> : null}

        <div className="admin-edit-layout">
          <section className="admin-panel">
            <span className="eyebrow">Редактирование</span>
            <h1 className="section-title">{item.title}</h1>
            <ItemForm key={item.id} item={itemFormData} categories={categories} />
          </section>

          <aside className="admin-panel">
            <h2>Удаление</h2>
            <p>Удаление вещи также удалит связи с категориями, примеры, комментарии и сохранения в списках.</p>
            <DeleteItemForm id={item.id} />
          </aside>
        </div>

        <section className="admin-panel">
          <span className="eyebrow">Примеры вещей</span>
          <h2 className="section-title" style={{ fontSize: "1.8rem" }}>
            Ссылки и изображения
          </h2>
          <ItemExamplesEditor itemId={item.id} examples={examples} />
        </section>
      </div>
    </main>
  );
}
