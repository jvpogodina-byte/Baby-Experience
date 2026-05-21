"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  name?: string;
  value?: string;
};

export function SubmitButton({ children, pendingLabel = "Сохраняем...", className = "button", name, value }: Props) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" name={name} value={value} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
