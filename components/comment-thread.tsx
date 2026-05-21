import type { CatalogComment } from "@/lib/catalog";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

type Props = {
  comments: CatalogComment[];
};

export function CommentThread({ comments }: Props) {
  if (!MVP_USER_FEATURES.comments) {
    return <p className="subtle">Комментарии появятся в следующей версии.</p>;
  }

  if (!comments.length) {
    return <p className="subtle">Пока нет комментариев</p>;
  }

  return (
    <div className="stack">
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <strong>
            {comment.author} <span className="subtle">• {comment.createdAt}</span>
          </strong>
          <div>{comment.body}</div>
        </div>
      ))}
    </div>
  );
}
