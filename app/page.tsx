import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { getCategoriesForHome, getFeaturedPublishedItems } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const secondaryCategorySlugs = new Set(["not-needed", "premium"]);

export default async function HomePage() {
  const [categories, featuredItems] = await Promise.all([getCategoriesForHome(), getFeaturedPublishedItems()]);
  const primaryCategories = categories.filter((category) => !secondaryCategorySlugs.has(category.slug));
  const secondaryCategories = categories.filter((category) => secondaryCategorySlugs.has(category.slug));

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-panel">
            <span className="eyebrow">Гид по вещам</span>
            <h1>Вещи, которые действительно помогают родителям и малышу</h1>
            <p>
              Привет! Меня зовут Юля и я собрала подборку вещей, которые действительно пригодятся родителю и
              малышу! Я постаралась быть максимально честной и объяснить в чем польза того или иного предмета
              и на что нужно обратить внимание при выборе. Помните, что это лишь мое личное мнение и оно может
              отличаться от вашего💚
            </p>
          </div>
          <div className="hero-aside">
            <div className="metric">
              <strong>{categories.length}</strong>
              <span>категорий и отдельных подборок: мама, малыш, дом, прогулки, путешествия, антипокупки, бюджет без ограничений</span>
            </div>
            <div className="metric">
              <strong>&gt;50</strong>
              <span>товаров в моей подборке</span>
            </div>
            <div className="metric">
              <strong>∞</strong>
              <span>спокойный родитель, который понимает, что пригодится именно ему</span>
            </div>
            <div className="hero-actions aside-actions">
              <Link className="button" href="/categories">
                Смотреть подборки
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="container">
          <h2 className="section-title">Подборки</h2>
          <p className="section-copy">
            Для удобства навигации вещи разделены на категории. Некоторые вещи могут встречаться сразу в
            нескольких подборках, если помогают в разных ситуациях.
          </p>
          <div className="grid category-grid primary-category-grid">
            {primaryCategories.map((category) => (
              <Link key={category.slug} className="category-card" href={`/categories/${category.slug}`}>
                <div>
                  <span className="label">{category.hero}</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <div className="badge-row">
                  <span className="badge category-open-badge">Открыть подборку</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid secondary-category-grid">
            {secondaryCategories.map((category) => (
              <Link key={category.slug} className="category-card secondary-category-card" href={`/categories/${category.slug}`}>
                <div>
                  <span className="label">{category.hero}</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <div className="badge-row">
                  <span className="badge category-open-badge">Открыть подборку</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="recommendations">
        <div className="container">
          <div>
            <h2 className="section-title">Несколько полезных вещей</h2>
            <p className="section-copy">
              Начни с этих карточек или переходи в нужную подборку. В каждой вещи есть короткое объяснение,
              примеры и подсказки, на что обратить внимание.
            </p>
          </div>
          <div className="grid item-grid">
            {featuredItems.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
