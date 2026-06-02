import { CategoryItemBrowser } from "@/components/category-item-browser";
import { getCategoriesForHome, getPublishedItems } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const defaultCategorySlug = "for-baby";

export default async function CategoriesPage() {
  const [categories, items] = await Promise.all([getCategoriesForHome(), getPublishedItems()]);
  const initialCategorySlug = categories.some((category) => category.slug === defaultCategorySlug)
    ? defaultCategorySlug
    : categories[0]?.slug ?? defaultCategorySlug;

  return (
    <main className="detail-hero">
      <div className="container">
        <CategoryItemBrowser categories={categories} initialCategorySlug={initialCategorySlug} items={items} />
      </div>
    </main>
  );
}
