import { notFound } from "next/navigation";
import { CategoryItemBrowser } from "@/components/category-item-browser";
import { getCategoriesForHome, getCategoryBySlug, getPublishedItems } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [categories, items] = await Promise.all([getCategoriesForHome(), getPublishedItems()]);

  return (
    <main className="detail-hero">
      <div className="container">
        <CategoryItemBrowser categories={categories} initialCategorySlug={category.slug} items={items} />
      </div>
    </main>
  );
}
