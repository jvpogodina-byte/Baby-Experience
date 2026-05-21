"use client";

import { useState } from "react";
import { ItemCard } from "@/components/item-card";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog";

type Props = {
  categories: CatalogCategory[];
  initialCategorySlug: string;
  items: CatalogItem[];
};

export function CategoryItemBrowser({ categories, initialCategorySlug, items }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(initialCategorySlug);
  const selectedCategory = categories.find((category) => category.slug === selectedSlug) ?? categories[0];
  const filteredItems = selectedCategory
    ? items.filter((item) => item.categorySlugs.includes(selectedCategory.slug))
    : [];

  return (
    <section className="category-browser">
      <div className="category-browser-header">
        <span className="eyebrow">Подборки вещей</span>
        <h1 className="section-title">{selectedCategory?.name ?? "Подборки"}</h1>
        {selectedCategory?.description ? <p className="section-copy">{selectedCategory.description}</p> : null}
      </div>

      <div className="category-filter-row" aria-label="Фильтр по категориям">
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            className={category.slug === selectedCategory?.slug ? "category-filter active" : "category-filter"}
            aria-pressed={category.slug === selectedCategory?.slug}
            onClick={() => {
              setSelectedSlug(category.slug);
              window.history.replaceState(null, "", `/categories/${category.slug}`);
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filteredItems.length ? (
        <div className="grid item-grid">
          {filteredItems.map((item) => (
            <ItemCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <div className="empty-state">В этой категории пока нет вещей.</div>
      )}
    </section>
  );
}
