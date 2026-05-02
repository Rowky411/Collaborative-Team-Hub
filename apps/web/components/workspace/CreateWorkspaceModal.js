"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../Modal";
import { FormField, TextInput, PrimaryButton } from "../ui/FormField";
import { useWorkspaceStore } from "../../lib/stores/workspaceStore";
import { apiError } from "../../lib/apiClient";

const PRESET_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export function CreateWorkspaceModal({ open, onClose, onCreated }) {
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);
  const [accent, setAccent] = useState(PRESET_COLORS[0]);
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: "", description: "" } });

  const close = () => {
    reset();
    setAccent(PRESET_COLORS[0]);
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const ws = await createWorkspace({
        name: values.name,
        description: values.description || undefined,
        accentColor: accent,
      });
      reset();
      setAccent(PRESET_COLORS[0]);
      onClose();
      onCreated?.(ws);
    } catch (err) {
      setServerError(apiError(err));
    }
  };

  return (
    <Modal open={open} onClose={close} title="New workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Name" error={errors.name?.message}>
          <TextInput
            register={register}
            name="name"
            {...register("name", {
              required: "Name is required",
              maxLength: { value: 100, message: "Too long" },
            })}
            placeholder="Engineering"
          />
        </FormField>

        <FormField label="Description (optional)">
          <textarea
            {...register("description", {
              maxLength: { value: 500, message: "Too long" },
            })}
            rows={3}
            className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Accent colour</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full ring-offset-2 transition ${
                  accent === c ? "ring-2 ring-[color:var(--foreground)]" : ""
                }`}
                aria-label={`Select ${c}`}
              />
            ))}
          </div>
        </div>

        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-md px-3 py-2 text-sm hover:bg-[color:var(--border)]/30"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create workspace"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
