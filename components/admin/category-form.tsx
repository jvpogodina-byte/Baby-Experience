"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type AdminActionState
} from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { slugify } from "@/lib/slugify";

type CategoryFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  hero: string;
  accent: string;
  order: number;
};

type Props = {
  category?: CategoryFormData;
};

const initialState: AdminActionState = {};

function FieldError({ message }: { message?: string }) {
  return message ? <span className="help error-text">{message}</span> : null;
}

export function CategoryForm({ category }: Props) {
  const action = category?.id ? updateCategoryAction : createCategoryAction;
  const [state, formAction] = useActionState(action, initialState);
  const initialSlug = category?.slug ?? "";
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(initialSlug);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialSlug));
  const generatedSlug = useMemo(() => slugify(name), [name]);

  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(initialSlug);
    setIsSlugManuallyEdited(Boolean(initialSlug));
  }, [category?.id, category?.name, initialSlug]);

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(generatedSlug);
    }
  }, [generatedSlug, isSlugManuallyEdited]);

  return (
    <form className="form admin-form" action={formAction}>
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}

      {state.message ? <div className="form-message error">{state.message}</div> : null}

      <div className="field">
        <label htmlFor="name">Название</label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <FieldError message={state.errors?.name} />
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
        <span className="help">Например: for-baby</span>
        <FieldError message={state.errors?.slug} />
      </div>

      <div className="field">
        <label htmlFor="description">Описание</label>
        <textarea id="description" name="description" defaultValue={category?.description ?? ""} required />
        <FieldError message={state.errors?.description} />
      </div>

      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="hero">Hero</label>
          <input id="hero" name="hero" defaultValue={category?.hero ?? ""} />
        </div>

        <div className="field">
          <label htmlFor="accent">Accent</label>
          <input id="accent" name="accent" defaultValue={category?.accent ?? "sand"} />
        </div>

        <div className="field">
          <label htmlFor="order">Порядок</label>
          <input id="order" name="order" type="number" defaultValue={category?.order ?? 0} />
        </div>
      </div>

      <div className="admin-actions">
        <SubmitButton pendingLabel={category?.id ? "Сохраняем..." : "Создаём..."}>
          {category?.id ? "Сохранить" : "Создать"}
        </SubmitButton>
      </div>
    </form>
  );
}

export function DeleteCategoryForm({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteCategoryAction, initialState);

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
