import Link from "next/link";
import { CommentModerationButton } from "@/components/comment-moderation-button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const commentDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export default async function AdminCommentsPage() {
  await requireAdmin();
  const comments = await prisma.comment.findMany({
    take: 50,
    include: {
      item: {
        select: {
          title: true,
          slug: true,
          status: true
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="detail-header">
          <span className="eyebrow">Комментарии</span>
          <h1 className="section-title">Модерация комментариев</h1>
          <p className="section-copy">
            Скрытый комментарий остаётся в базе, но не показывается на публичной странице вещи.
          </p>
        </div>

        <section className="admin-panel">
          <div className="stack">
            {comments.length ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <strong>{comment.user.name ?? comment.user.email ?? "Пользователь"}</strong>
                  <div className="subtle">
                    {commentDateFormatter.format(comment.createdAt)} •{" "}
                    <Link href={`/items/${comment.item.slug}`}>{comment.item.title}</Link>
                  </div>
                  <p>{comment.body}</p>
                  <div className="badge-row">
                    <span className="badge">{comment.isHidden ? "Скрыт" : "Публичен"}</span>
                    <span className="badge">Вещь: {comment.item.status}</span>
                  </div>
                  <div className="section-divider" />
                  <CommentModerationButton commentId={comment.id} isHidden={comment.isHidden} />
                </div>
              ))
            ) : (
              <p className="subtle">Пока нет комментариев.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
