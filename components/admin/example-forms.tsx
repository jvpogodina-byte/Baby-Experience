"use client";

import { ChangeEvent, useActionState, useState } from "react";
import {
  createExampleAction,
  deleteExampleAction,
  updateExampleAction,
  type AdminActionState
} from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";

type ExampleKindValue = "LINK" | "IMAGE" | "BOTH";

type AdminExample = {
  id: string;
  label: string;
  kind: ExampleKindValue;
  url: string;
  imageUrl: string;
  caption: string;
};

type Props = {
  itemId: string;
  examples: AdminExample[];
};

const initialState: AdminActionState = {};
const maxUploadSize = 4.5 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function FieldError({ message }: { message?: string }) {
  return message ? <span className="help error-text">{message}</span> : null;
}

function ExampleFields({ example, state }: { example?: AdminExample; state: AdminActionState }) {
  const fieldSuffix = example?.id ?? "new";
  const [label, setLabel] = useState(example?.label ?? "");
  const [imageUrl, setImageUrl] = useState(example?.imageUrl ?? "");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
    formData.append("alt", label);

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

      setImageUrl(result.mediaAsset.url);
      setUploadMessage("Изображение загружено, URL подставлен.");
    } catch {
      setUploadError("Не удалось загрузить изображение. Проверьте соединение и повторите попытку.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor={`label-${fieldSuffix}`}>Label</label>
          <input id={`label-${fieldSuffix}`} name="label" value={label} onChange={(event) => setLabel(event.target.value)} />
          <FieldError message={state.errors?.label} />
        </div>

        <div className="field">
          <label htmlFor={`kind-${fieldSuffix}`}>Kind</label>
          <select id={`kind-${fieldSuffix}`} name="kind" defaultValue={example?.kind ?? "LINK"}>
            <option value="LINK">LINK</option>
            <option value="IMAGE">IMAGE</option>
            <option value="BOTH">BOTH</option>
          </select>
        </div>
      </div>

      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor={`url-${fieldSuffix}`}>URL</label>
          <input id={`url-${fieldSuffix}`} name="url" defaultValue={example?.url ?? ""} />
          <FieldError message={state.errors?.url} />
        </div>

        <div className="field">
          <label htmlFor={`image-${fieldSuffix}`}>Image URL</label>
          <input
            id={`image-${fieldSuffix}`}
            name="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <FieldError message={state.errors?.imageUrl} />
        </div>
      </div>

      <div className="admin-form-grid upload-grid">
        <div className="field">
          <label htmlFor={`upload-${fieldSuffix}`}>Загрузить изображение</label>
          <input
            id={`upload-${fieldSuffix}`}
            type="file"
            accept={acceptedImageTypes.join(",")}
            onChange={uploadImage}
            disabled={isUploading}
          />
          <span className="help">JPEG, PNG, WebP или GIF до 4.5 MB. Ручной Image URL можно оставить как fallback.</span>
          {isUploading ? <span className="help">Загружаем изображение...</span> : null}
          {uploadError ? <span className="help error-text">{uploadError}</span> : null}
          {uploadMessage ? <span className="help success-text">{uploadMessage}</span> : null}
        </div>

        <div className="field">
          <span className="field-label">Preview</span>
          {imageUrl ? (
            <div className="image-preview">
              <img src={imageUrl} alt={label || "Preview"} />
            </div>
          ) : (
            <div className="image-preview empty-preview">Изображение не выбрано</div>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor={`caption-${fieldSuffix}`}>Caption</label>
        <textarea
          id={`caption-${fieldSuffix}`}
          name="caption"
          defaultValue={example?.caption ?? ""}
        />
      </div>
    </>
  );
}

function CreateExampleForm({ itemId }: { itemId: string }) {
  const [state, formAction] = useActionState(createExampleAction, initialState);

  return (
    <form className="form admin-form" action={formAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <h3>Добавить пример</h3>
      {state.message ? <div className="form-message error">{state.message}</div> : null}
      <ExampleFields state={state} />
      <SubmitButton pendingLabel="Добавляем...">Создать</SubmitButton>
    </form>
  );
}

function DeleteExampleForm({ itemId, id }: { itemId: string; id: string }) {
  const [state, formAction] = useActionState(deleteExampleAction, initialState);

  return (
    <form className="form" action={formAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="id" value={id} />
      {state.message ? <div className="form-message error">{state.message}</div> : null}
      <SubmitButton className="button secondary danger" pendingLabel="Удаляем...">
        Удалить
      </SubmitButton>
    </form>
  );
}

function EditExampleForm({ itemId, example }: { itemId: string; example: AdminExample }) {
  const [state, formAction] = useActionState(updateExampleAction, initialState);

  return (
    <div className="admin-example">
      <form className="form admin-form" action={formAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="id" value={example.id} />
        {state.message ? <div className="form-message error">{state.message}</div> : null}
        <ExampleFields example={example} state={state} />
        <SubmitButton pendingLabel="Сохраняем...">Сохранить</SubmitButton>
      </form>
      <DeleteExampleForm itemId={itemId} id={example.id} />
    </div>
  );
}

export function ItemExamplesEditor({ itemId, examples }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="stack">
      <div className="admin-actions">
        <button className="button secondary" type="button" onClick={() => setIsCreateOpen((value) => !value)}>
          {isCreateOpen ? "Скрыть форму примера" : "Добавить пример"}
        </button>
      </div>
      {isCreateOpen ? <CreateExampleForm itemId={itemId} /> : null}
      {examples.length ? <div className="section-divider" /> : null}
      {examples.length ? <h3>Текущие примеры</h3> : null}
      {examples.length ? (
        examples.map((example) => <EditExampleForm key={example.id} itemId={itemId} example={example} />)
      ) : (
        <p className="subtle">У вещи пока нет примеров.</p>
      )}
    </div>
  );
}
