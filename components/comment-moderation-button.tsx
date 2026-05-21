"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  commentId: string;
  isHidden: boolean;
};

export function CommentModerationButton({ commentId, isHidden }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggleVisibility() {
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isHidden: !isHidden
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(data?.message ?? "Не удалось обновить комментарий.");
        return;
      }

      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stack">
      <button className="button secondary" type="button" onClick={toggleVisibility} disabled={isSubmitting}>
        {isSubmitting ? "Сохраняем..." : isHidden ? "Показать" : "Скрыть"}
      </button>
      {message ? <div className="form-message error">{message}</div> : null}
    </div>
  );
}
