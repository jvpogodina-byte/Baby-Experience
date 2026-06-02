"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { CatalogItem } from "@/lib/catalog";

type Props = {
  item: Pick<CatalogItem, "slug" | "title" | "summary" | "categories" | "previewImageUrl" | "example" | "examples">;
};

export function ItemCard({ item }: Props) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const purchaseLinks = item.examples.filter((example) => example.url);
  const photoHint = item.examples.find((example) => example.imageUrl);
  const hasPhotoHint = Boolean(photoHint?.imageUrl || photoHint?.caption);
  const previewModal =
    previewOpen && typeof document !== "undefined" ? (
      <div className="photo-modal" role="dialog" aria-modal="true" aria-label={`Превью: ${item.title}`}>
        <button type="button" className="photo-modal-backdrop" aria-label="Закрыть" onClick={() => setPreviewOpen(false)} />
        <div className="photo-modal-card">
          <button type="button" className="photo-modal-close" aria-label="Закрыть" onClick={() => setPreviewOpen(false)}>
            ×
          </button>
          {item.previewImageUrl ? (
            <img src={item.previewImageUrl} alt={item.title} />
          ) : (
            <div className="media-fallback">Фото не добавлено</div>
          )}
        </div>
      </div>
    ) : null;
  const photoModal =
    photoOpen && typeof document !== "undefined" ? (
      <div className="photo-modal" role="dialog" aria-modal="true" aria-label={`Фотоподсказка: ${item.title}`}>
        <button type="button" className="photo-modal-backdrop" aria-label="Закрыть" onClick={() => setPhotoOpen(false)} />
        <div className="photo-modal-card">
          <button type="button" className="photo-modal-close" aria-label="Закрыть" onClick={() => setPhotoOpen(false)}>
            ×
          </button>
          {photoHint?.imageUrl ? (
            <img src={photoHint.imageUrl} alt={photoHint.label} />
          ) : (
            <div className="media-fallback">Фото не добавлено</div>
          )}
          {photoHint?.caption || photoHint?.label ? <p>{photoHint.caption || photoHint.label}</p> : null}
        </div>
      </div>
    ) : null;

  return (
    <article className="card item-list-card">
      <div className="card-media item-list-media">
        {item.previewImageUrl ? (
          <button
            type="button"
            className="item-preview-button"
            aria-label={`Увеличить изображение товара ${item.title}`}
            onClick={() => setPreviewOpen(true)}
          >
            <img src={item.previewImageUrl} alt={item.title} />
          </button>
        ) : (
          <div className="media-fallback">Без изображения</div>
        )}
      </div>
      <div className="item-list-body">
        <div className="item-list-heading">
          <h3>{item.title}</h3>
        </div>
        <p>{item.summary}</p>
        <div className="badge-row">
          {item.categories.map((category) => (
            <span key={category.slug} className="badge">
              {category.name}
            </span>
          ))}
        </div>
        {examplesOpen && purchaseLinks.length ? (
          <div className="examples-panel">
            {purchaseLinks.map((example) => (
              <a key={example.id} href={example.url} target="_blank" rel="noreferrer">
                {example.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
      <div className="item-list-actions">
        {purchaseLinks.length ? (
          <button
            type="button"
            className="button secondary item-list-link"
            aria-expanded={examplesOpen}
            onClick={() => setExamplesOpen((isOpen) => !isOpen)}
          >
            Примеры
          </button>
        ) : null}
        {hasPhotoHint ? (
          <button type="button" className="button secondary item-list-link" onClick={() => setPhotoOpen(true)}>
            Фотоподсказка
          </button>
        ) : null}
      </div>
      {previewModal ? createPortal(previewModal, document.body) : null}
      {photoModal ? createPortal(photoModal, document.body) : null}
    </article>
  );
}
