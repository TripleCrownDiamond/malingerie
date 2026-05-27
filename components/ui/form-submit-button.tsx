"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
};

export function FormSubmitButton({ idleLabel, pendingLabel = "Chargement...", className }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={
        className ??
        "rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}