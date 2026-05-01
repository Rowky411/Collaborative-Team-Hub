"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../lib/stores/authStore";
import { apiClient, apiError } from "../../../lib/apiClient";
import { FormField, TextInput, PrimaryButton } from "../../../components/ui/FormField";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setUser = useAuthStore.setState;
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: { name: user?.name || "" } });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      await updateProfile({ name: values.name });
      setSavedAt(Date.now());
    } catch (err) {
      alert(apiError(err));
    }
  };

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await apiClient.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ user: data.data.user });
    } catch (err) {
      setUploadError(apiError(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Update your name and avatar
      </p>

      <section className="mt-6 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[color:var(--border)]">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[color:var(--muted)]">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelected}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--border)]/30 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Change avatar"}
          </button>
          {uploadError ? (
            <p className="text-xs text-red-600">{uploadError}</p>
          ) : (
            <p className="text-xs text-[color:var(--muted)]">PNG or JPG, up to 4MB</p>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <FormField label="Email">
          <input
            type="email"
            value={user.email}
            disabled
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--border)]/20 px-3 py-2 text-sm"
          />
        </FormField>

        <FormField label="Name" error={errors.name?.message}>
          <TextInput
            register={register}
            name="name"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 1, message: "Name is required" },
              maxLength: { value: 80, message: "Too long" },
            })}
          />
        </FormField>

        <div className="flex items-center gap-3">
          <PrimaryButton type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </PrimaryButton>
          {savedAt ? (
            <span className="text-xs text-emerald-600">Saved.</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
