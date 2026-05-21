"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";
import type { SavedListView } from "@/lib/saved-lists";

type Props = {
  itemId: string;
  itemSlug: string;
  lists: SavedListView[];
};

type CreateListResponse = {
  list?: {
    id: string;
  };
  message?: string;
};

type ApiMessage = {
  message?: string;
};

async function readApiMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as ApiMessage | null;
  return data?.message ?? fallback;
}

export function SaveToListPanel({ itemId, itemSlug, lists }: Props) {
  const router = useRouter();
  const [selectedListId, setSelectedListId] = useState(lists[0]?.id ?? "");
  const [newListName, setNewListName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedListId && lists[0]?.id) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  if (!MVP_USER_FEATURES.savedLists) {
    return <p className="subtle">Сохранённые списки появятся в следующей версии.</p>;
  }

  const selectedList = lists.find((list) => list.id === selectedListId);
  const isAlreadySaved = Boolean(selectedList?.items.some((item) => item.id === itemId));

  function resetMessage() {
    if (message) {
      setMessage("");
      setIsError(false);
    }
  }

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = newListName.trim();
    if (!trimmedName) {
      setIsError(true);
      setMessage("Введите название списка.");
      return;
    }

    setPendingAction("create-list");
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/saved-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: trimmedName
        })
      });

      if (!response.ok) {
        setIsError(true);
        setMessage(await readApiMessage(response, "Не удалось создать список."));
        return;
      }

      const data = (await response.json().catch(() => null)) as CreateListResponse | null;
      if (data?.list?.id) {
        setSelectedListId(data.list.id);
      }

      setNewListName("");
      setMessage("Список создан. Теперь можно сохранить вещь.");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Не удалось связаться с сервером. Попробуйте ещё раз.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAddToList() {
    if (!selectedListId) {
      setIsError(true);
      setMessage("Сначала выберите список.");
      return;
    }

    setPendingAction("add-item");
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/saved-lists/${selectedListId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemSlug
        })
      });

      if (!response.ok) {
        setIsError(true);
        setMessage(await readApiMessage(response, "Не удалось сохранить вещь."));
        return;
      }

      const data = (await response.json().catch(() => null)) as { alreadySaved?: boolean } | null;
      setMessage(data?.alreadySaved ? "Эта вещь уже есть в выбранном списке." : "Вещь сохранена в список.");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Сетевая ошибка не дала сохранить вещь. Попробуйте ещё раз.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="stack">
      {lists.length ? (
        <>
          <div className="field">
            <label htmlFor="saved-list-select">Список</label>
            <select
              id="saved-list-select"
              value={selectedListId}
              onChange={(event) => {
                setSelectedListId(event.target.value);
                resetMessage();
              }}
              disabled={pendingAction === "add-item"}
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {isAlreadySaved ? (
            <p className="subtle">Эта вещь уже сохранена в выбранном списке.</p>
          ) : (
            <button className="button" type="button" onClick={handleAddToList} disabled={pendingAction === "add-item"}>
              {pendingAction === "add-item" ? "Сохраняем..." : "Сохранить в список"}
            </button>
          )}
        </>
      ) : (
        <p className="subtle">У вас пока нет списков. Создайте первый и вернитесь к сохранению вещи.</p>
      )}

      <form className="form compact-form" onSubmit={handleCreateList}>
        <div className="field">
          <label htmlFor="new-saved-list-name">Создать список</label>
          <input
            id="new-saved-list-name"
            placeholder="Например, На потом"
            value={newListName}
            onChange={(event) => {
              setNewListName(event.target.value);
              resetMessage();
            }}
            disabled={pendingAction === "create-list"}
            maxLength={80}
          />
        </div>
        <button className="button secondary" type="submit" disabled={pendingAction === "create-list"}>
          {pendingAction === "create-list" ? "Создаём..." : lists.length ? "Создать ещё список" : "Создать первый список"}
        </button>
      </form>

      {message ? <div className={isError ? "form-message error" : "form-message success"}>{message}</div> : null}
    </div>
  );
}
