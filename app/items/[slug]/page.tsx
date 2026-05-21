import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { CommentThread } from "@/components/comment-thread";
import { ItemCard } from "@/components/item-card";
import { SaveToListPanel } from "@/components/save-to-list-panel";
import { getPublishedItemBySlug, getRelatedPublishedItems } from "@/lib/catalog";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";
import { getSavedListsForUser } from "@/lib/saved-lists";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const showSavedLists = MVP_USER_FEATURES.savedLists;
  const showComments = MVP_USER_FEATURES.comments;
  const showUserSidebar = showSavedLists || showComments;
  const [relatedItems, session] = await Promise.all([
    getRelatedPublishedItems(item.slug),
    showSavedLists ? getServerSession(authOptions) : Promise.resolve(null)
  ]);
  const savedLists =
    showSavedLists && session?.user?.id ? await getSavedListsForUser(session.user.id) : [];

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="detail-header">
          <Link className="button secondary" href={item.categories[0] ? `/categories/${item.categories[0].slug}` : "/"}>
            Назад к подборке
          </Link>
          <span className="eyebrow">Карточка вещи</span>
          <h1 className="section-title">{item.title}</h1>
          <p className="section-copy">{item.summary}</p>
          <div className="badge-row">
            {item.categories.map((category) => (
              <Link key={category.slug} className="badge" href={`/categories/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className={showUserSidebar ? "detail-layout" : "detail-layout detail-layout-public"}>
          <section className="admin-panel stack">
            <div className="card-media">
              {item.previewImageUrl ? <img src={item.previewImageUrl} alt={item.title} /> : <div className="media-fallback">Фото не добавлено</div>}
            </div>

            <div className="stack">
              <h2>Примеры и подсказки</h2>
              {item.examples.length ? (
                <div className="examples-panel">
                  {item.examples.map((example) => (
                    <div key={example.id} className="stack">
                      {example.url ? (
                        <a href={example.url} target="_blank" rel="noreferrer">
                          {example.label}
                        </a>
                      ) : (
                        <strong>{example.label}</strong>
                      )}
                      {example.imageUrl ? <img src={example.imageUrl} alt={example.label} /> : null}
                      {example.caption ? <p className="subtle">{example.caption}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="subtle">
                  В этой карточке пока достаточно основного описания. Если появятся полезные примеры, они будут здесь.
                </p>
              )}
            </div>
          </section>

          {showUserSidebar ? (
            <aside className="detail-sidebar">
              {showSavedLists ? (
                <section className="admin-panel stack">
                  <h2>Сохранить</h2>
                  <SaveToListPanel itemId={item.id} itemSlug={item.slug} lists={savedLists} />
                </section>
              ) : null}

              {showComments ? (
                <section className="admin-panel stack">
                  <h2>Комментарии</h2>
                  <CommentThread comments={item.comments} />
                  <CommentForm itemSlug={item.slug} />
                </section>
              ) : null}
            </aside>
          ) : null}
        </div>

        {relatedItems.length ? (
          <section className="section">
            <div>
              <h2 className="section-title">Похожие вещи</h2>
              <p className="section-copy">Ещё несколько рекомендаций из тех же подборок.</p>
            </div>
            <div className="grid item-grid">
              {relatedItems.map((relatedItem) => (
                <ItemCard key={relatedItem.slug} item={relatedItem} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
