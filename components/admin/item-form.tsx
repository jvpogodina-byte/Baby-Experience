"use client";

import { ChangeEvent, useActionState, useEffect, useMemo, useState } from "react";
import { createItemAction, deleteItemAction, updateItemAction, type AdminActionState } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { slugify } from "@/lib/slugify";

type AdminCategoryOption = {
  id: string;
  name: string;
};

type AdminItemFormData = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  previewImageUrl?: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categoryIds: string[];
};

type Props = {
  item?: AdminItemFormData;
  categories: AdminCategoryOption[];
};

const initialState: AdminActionState = {};
const maxUploadSize = 4.5 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function FieldError({ message }: { message?: string }) {
  return message ? <span className="help error-text">{message}</span> : null;
}

export function ItemForm({ item, categories }: Props) {
  const action = item?.id ? updateItemAction : createItemAction;
  const [state, formAction] = useActionState(action, initialState);
  const selectedCategoryIds = new Set(item?.categoryIds ?? []);
  const initialSlug = item?.slug ?? "";
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(initialSlug);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialSlug));
  const [previewImageUrl, setPreviewImageUrl] = useState(item?.previewImageUrl ?? "");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const generatedSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    setTitle(item?.title ?? "");
    setSlug(initialSlug);
    setIsSlugManuallyEdited(Boolean(initialSlug));
    setPreviewImageUrl(item?.previewImageUrl ?? "");
    setUploadError("");
    setUploadMessage("");
  }, [item?.id, item?.title, item?.previewImageUrl, initialSlug]);

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(generatedSlug);
    }
  }, [generatedSlug, isSlugManuallyEdited]);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError("");
    setUploadMessage("");

    if (!file) {
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setUploadError("Поддерживаются только JPEG, PNG, WebP и GIF.");
      event.target.value = "";
      return;
    }

    if (file.size > maxUploadSize) {
      setUploadError("Файл слишком большой. Максимальный размер: 4.5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", title || "Preview");

    setIsUploading(true);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { mediaAsset?: { url?: string }; error?: string };

      if (!response.ok || !result.mediaAsset?.url) {
        setUploadError(result.error ?? "Не удалось загрузить изображение.");
        return;
      }

      setPreviewImageUrl(result.mediaAsset.url);

      if (item?.id) {
        const saveResponse = await fetch(`/api/admin/items/${item.id}/preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            previewImageUrl: result.mediaAsset.url
          })
        });

        if (!saveResponse.ok) {
          const saveResult = (await saveResponse.json().catch(() => null)) as { message?: string } | null;
          setUploadError(saveResult?.message ?? "Изображение загружено, но не удалось сохранить превью товара.");
          return;
        }

        setUploadMessage("Изображение загружено и сразу сохранено как превью.");
        return;
      }

      setUploadMessage("Изображение загружено. Сохрани товар, чтобы закрепить превью.");
    } catch {
      setUploadError("Не удалось загрузить изображение. Проверьте соединение и повторите попытку.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <form className="form admin-form" action={formAction}>
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="previewImageUrl" value={previewImageUrl} />

      {state.message ? <div className="form-message error">{state.message}</div> : null}

      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="title">Название</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <FieldError message={state.errors?.title} />
        </div>

        <div className="field">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              const nextSlug = slugify(event.target.value);
              setSlug(nextSlug);
              setIsSlugManuallyEdited(nextSlug.length > 0);
            }}
            required
          />
          <FieldError message={state.errors?.slug} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">Описание</label>
        <textarea id="summary" name="summary" defaultValue={item?.summary ?? ""} required />
        <FieldError message={state.errors?.summary} />
      </div>

      <div className="admin-form-grid upload-grid">
        <div className="field">
          <label htmlFor="preview-upload">Картинка-превью</label>
          <input
            id="preview-upload"
            type="file"
            accept={acceptedImageTypes.join(",")}
            onChange={uploadImage}
            disabled={isUploading}
          />
          <span className="help">JPEG, PNG, WebP или GIF до 4.5 MB.</span>
          {isUploading ? <span className="help">Загружаем изображение...</span> : null}
          {uploadError ? <span className="help error-text">{uploadError}</span> : null}
          {uploadMessage ? <span className="help success-text">{uploadMessage}</span> : null}
        </div>

        <div className="field">
          <span className="field-label">Preview</span>
          {previewImageUrl ? (
            <div className="image-preview">
              <img src={previewImageUrl} alt={title || "Preview"} />
            </div>
          ) : (
            <div className="image-preview empty-preview">Изображение не выбрано</div>
          )}
        </div>
      </div>

      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="status">Статус</label>
          <select id="status" name="status" defaultValue={item?.status ?? "DRAFT"} disabled={!item?.id}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          {!item?.id ? <span className="help">Новая вещь всегда создаётся как DRAFT.</span> : null}
        </div>

        <label className="checkbox-field">
          <input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} /> Показывать на главной
        </label>
      </div>

      <fieldset className="admin-fieldset">
        <legend>Категории</legend>
        <div className="checkbox-grid">
          {categories.map((category) => (
            <label key={category.id} className="checkbox-field">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
              />
              {category.name}
            </label>
          ))}
        </div>
        <FieldError message={state.errors?.categoryIds} />
      </fieldset>

      <div className="admin-actions">
        <SubmitButton pendingLabel={item?.id ? "Сохраняем..." : "Создаём..."}>
          {item?.id ? "Сохранить" : "Создать"}
        </SubmitButton>
      </div>
    </form>
  );
}

export function DeleteItemForm({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteItemAction, initialState);

  return (
    <form className="form" action={formAction}>
      <input type="hidden" name="id" value={id} />
      {state.message ? <div className="form-message error">{state.message}</div> : null}
      <SubmitButton className="button secondary danger" pendingLabel="Удаляем...">
        Удалить
      </SubmitButton>
    </form>
  );
}
