import Link from "next/link";
import { getCategoriesForHome, getPublishedItems } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function formatItemCount(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const noun = lastDigit === 1 && lastTwoDigits !== 11 ? "вещь" : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? "вещи" : "вещей";

  return `${count} ${noun}`;
}

export default async function CategoriesPage() {
  const [categories, items] = await Promise.all([getCategoriesForHome(), getPublishedItems()]);
  const itemCountByCategory = new Map<string, number>();

  for (const item of items) {
    for (const slug of item.categorySlugs) {
      itemCountByCategory.set(slug, (itemCountByCategory.get(slug) ?? 0) + 1);
    }
  }

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="detail-header">
          <span className="eyebrow">Все подборки</span>
          <h1 className="section-title">Выбери, что сейчас актуально</h1>
          <p className="section-copy">
            Категории помогают быстро пройтись по вещам для мамы, малыша, дома, прогулок и поездок. Открывай
            подборку и переходи в карточки вещей без регистрации.
          </p>
        </div>

        {categories.length ? (
          <div className="grid category-grid primary-category-grid categories-overview-grid">
            {categories.map((category) => {
              const itemCount = itemCountByCategory.get(category.slug) ?? 0;

              return (
                <Link key={category.slug} className="category-card" href={`/categories/${category.slug}`}>
                  <div>
                    <span className="label">{category.hero}</span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <div className="badge-row">
                    <span className="badge category-open-badge">Открыть подборку</span>
                    <span className="badge">{formatItemCount(itemCount)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">Подборки скоро появятся.</div>
        )}
      </div>
    </main>
  );
}
