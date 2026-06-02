"use client";

import { useState } from "react";
import { updateCategoryItemOrderAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";

type CategoryOrderItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  previewImageUrl?: string | null;
};

type Props = {
  categoryId: string;
  items: CategoryOrderItem[];
};

function moveItem(items: CategoryOrderItem[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function CategoryItemOrderForm({ categoryId, items }: Props) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function reorder(droppedId: string) {
    if (!draggedId || draggedId === droppedId) {
      return;
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === draggedId);
    const toIndex = orderedItems.findIndex((item) => item.id === droppedId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    setOrderedItems(moveItem(orderedItems, fromIndex, toIndex));
  }

  return (
    <form className="form admin-form" action={updateCategoryItemOrderAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="itemOrder" value={JSON.stringify(orderedItems.map((item) => item.id))} />

      {orderedItems.length ? (
        <div className="sortable-list" aria-label="Порядок товаров в категории">
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              className={draggedId === item.id ? "sortable-row dragging" : "sortable-row"}
              draggable
              onDragStart={() => setDraggedId(item.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorder(item.id)}
            >
              <span className="drag-handle" aria-hidden="true">
                ::
              </span>
              <span className="sortable-index">{index + 1}</span>
              {item.previewImageUrl ? (
                <img className="sortable-thumb" src={item.previewImageUrl} alt="" />
              ) : (
                <span className="sortable-thumb empty-thumb" aria-hidden="true" />
              )}
              <span>
                <strong>{item.title}</strong>
                <span className="subtle">/{item.slug}</span>
              </span>
              <span className="badge">{item.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="subtle">В этой категории пока нет товаров.</p>
      )}

      <div className="admin-actions">
        <SubmitButton pendingLabel="Сохраняем порядок...">Сохранить порядок</SubmitButton>
      </div>
    </form>
  );
}
