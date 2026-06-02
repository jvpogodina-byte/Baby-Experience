"use client";

import { useState } from "react";
import { ItemCard } from "@/components/item-card";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog";

type SortMode = "default" | "title-asc" | "featured-first" | "examples-first";

type Props = {
  categories: CatalogCategory[];
  initialCategorySlug: string;
  items: CatalogItem[];
};

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "title-asc", label: "По алфавиту" },
  { value: "featured-first", label: "Сначала важное" },
  { value: "examples-first", label: "Сначала с примерами" }
];

function getExampleScore(item: CatalogItem) {
  return item.examples.filter((example) => example.url || example.imageUrl || example.caption).length;
}

function sortItems(items: CatalogItem[], sortMode: SortMode) {
  return [...items].sort((first, second) => {
    switch (sortMode) {
      case "title-asc":
        return first.title.localeCompare(second.title, "ru");
      case "featured-first":
        return Number(second.featured) - Number(first.featured) || first.title.localeCompare(second.title, "ru");
      case "examples-first":
        return getExampleScore(second) - getExampleScore(first) || first.title.localeCompare(second.title, "ru");
      case "default":
      default:
        return 0;
    }
  });
}

export function CategoryItemBrowser({ categories, initialCategorySlug, items }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(initialCategorySlug);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const selectedCategory = categories.find((category) => category.slug === selectedSlug) ?? categories[0];
  const filteredItems = selectedCategory
    ? items.filter((item) => item.categorySlugs.includes(selectedCategory.slug))
    : [];
  const sortedItems = sortItems(filteredItems, sortMode);

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

      <div className="category-toolbar">
        <label htmlFor="category-sort">Сортировка</label>
        <select
          id="category-sort"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {sortedItems.length ? (
        <div className="grid item-grid">
          {sortedItems.map((item) => (
            <ItemCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <div className="empty-state">В этой категории пока нет вещей.</div>
      )}
    </section>
  );
}
