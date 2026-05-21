"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

const MAX_COMMENT_LENGTH = 2000;

type Props = {
  itemSlug: string;
};

export function CommentForm({ itemSlug }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!MVP_USER_FEATURES.comments) {
    return <p className="subtle">Комментарии временно недоступны.</p>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setIsError(true);
      setMessage("Комментарий не может быть пустым.");
      return;
    }

    if (trimmedBody.length > MAX_COMMENT_LENGTH) {
      setIsError(true);
      setMessage(`Комментарий должен быть не длиннее ${MAX_COMMENT_LENGTH} символов.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemSlug,
          body: trimmedBody
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setIsError(true);
        setMessage(data?.message ?? "Не удалось отправить комментарий.");
        return;
      }

      setBody("");
      setMessage("Комментарий опубликован.");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="comment">Новый комментарий</label>
        <textarea
          id="comment"
          name="comment"
          placeholder="Поделитесь опытом: что помогло, что оказалось лишним, на что обратить внимание."
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            if (message) {
              setMessage("");
              setIsError(false);
            }
          }}
          maxLength={MAX_COMMENT_LENGTH}
          disabled={isSubmitting}
          required
        />
        <span className="help">
          {body.trim().length}/{MAX_COMMENT_LENGTH}
        </span>
      </div>
      {message ? <div className={isError ? "form-message error" : "form-message"}>{message}</div> : null}
      <button className="button secondary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Отправляем..." : "Опубликовать комментарий"}
      </button>
    </form>
  );
}
