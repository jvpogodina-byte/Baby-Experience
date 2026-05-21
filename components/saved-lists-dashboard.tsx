"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";
import type { SavedListView } from "@/lib/saved-lists";

type Props = {
  lists: SavedListView[];
};

type ApiMessage = {
  message?: string;
};

async function readApiMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as ApiMessage | null;
  return data?.message ?? fallback;
}

export function SavedListsDashboard({ lists }: Props) {
  const router = useRouter();
  const [listName, setListName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (!MVP_USER_FEATURES.savedLists) {
    return <p className="subtle">Личный кабинет и сохранённые списки появятся в следующей версии.</p>;
  }

  async function runAction(actionId: string, action: () => Promise<Response>, successMessage: string) {
    setMessage("");
    setIsError(false);
    setPendingAction(actionId);

    try {
      const response = await action();

      if (!response.ok) {
        setIsError(true);
        setMessage(await readApiMessage(response, "Не удалось выполнить действие."));
        return;
      }

      setMessage(successMessage);
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Сеть капризничает. Попробуйте ещё раз через пару секунд.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = listName.trim();
    if (!trimmedName) {
      setIsError(true);
      setMessage("Введите название списка.");
      return;
    }

    await runAction(
      "create-list",
      () =>
        fetch("/api/saved-lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: trimmedName
          })
        }),
      "Список создан."
    );

    setListName("");
  }

  async function handleDeleteList(list: SavedListView) {
    const shouldDelete = window.confirm(`Удалить список «${list.name}»?`);
    if (!shouldDelete) {
      return;
    }

    await runAction(
      `delete-list-${list.id}`,
      () =>
        fetch(`/api/saved-lists/${list.id}`, {
          method: "DELETE"
        }),
      "Список удалён."
    );
  }

  async function handleRemoveItem(listId: string, itemId: string) {
    await runAction(
      `remove-item-${listId}-${itemId}`,
      () =>
        fetch(`/api/saved-lists/${listId}/items`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            itemId
          })
        }),
      "Вещь убрана из списка."
    );
  }

  return (
    <div className="stack">
      <form className="form compact-form" onSubmit={handleCreateList}>
        <div className="field">
          <label htmlFor="saved-list-name">Новый список</label>
          <input
            id="saved-list-name"
            name="name"
            placeholder="Например, Роддом или Первые месяцы"
            value={listName}
            onChange={(event) => setListName(event.target.value)}
            disabled={pendingAction === "create-list"}
            maxLength={80}
            required
          />
        </div>
        <button className="button" type="submit" disabled={pendingAction === "create-list"}>
          {pendingAction === "create-list" ? "Создаём..." : "Создать список"}
        </button>
      </form>

      {message ? <div className={isError ? "form-message error" : "form-message success"}>{message}</div> : null}

      {lists.length ? (
        <div className="saved-list-grid">
          {lists.map((list) => (
            <section key={list.id} className="saved-list">
              <div className="saved-list-header">
                <div>
                  <h2>{list.name}</h2>
                  {list.description ? <p>{list.description}</p> : null}
                </div>
                <button
                  className="button secondary danger"
                  type="button"
                  onClick={() => handleDeleteList(list)}
                  disabled={pendingAction === `delete-list-${list.id}`}
                >
                  {pendingAction === `delete-list-${list.id}` ? "Удаляем..." : "Удалить список"}
                </button>
              </div>

              {list.items.length ? (
                <div className="saved-list-items">
                  {list.items.map((item) => (
                    <article key={item.id} className="saved-list-item">
                      <Link className="saved-list-thumb" href={`/items/${item.slug}`}>
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : null}
                      </Link>
                      <div>
                        <Link className="saved-list-title" href={`/items/${item.slug}`}>
                          {item.title}
                        </Link>
                        <p>{item.summary}</p>
                      </div>
                      <button
                        className="button secondary"
                        type="button"
                        onClick={() => handleRemoveItem(list.id, item.id)}
                        disabled={pendingAction === `remove-item-${list.id}-${item.id}`}
                      >
                        {pendingAction === `remove-item-${list.id}-${item.id}` ? "Убираем..." : "Убрать"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="subtle">В этом списке пока нет вещей. Откройте карточку вещи и сохраните её сюда.</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="callout">
          <strong>Списков пока нет</strong>
          <p>Создайте первый список, а затем сохраняйте в него вещи со страниц рекомендаций.</p>
        </div>
      )}
    </div>
  );
}
