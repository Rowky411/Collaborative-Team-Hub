"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../lib/stores/authStore";
import { FormField, TextInput, PrimaryButton } from "../../../components/ui/FormField";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    setServerError(null);
    const result = await login({ email: values.email, password: values.password });
    setSubmitting(false);
    if (result.ok) {
      router.replace("/workspaces");
    } else {
      setServerError(result.message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-[color:var(--muted)]">Log in to your Team Hub</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Email" error={errors.email?.message}>
            <TextInput
              register={register}
              name="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /.+@.+\..+/, message: "Invalid email" },
              })}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <TextInput
              register={register}
              name="password"
              type="password"
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
            />
          </FormField>

          {serverError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          ) : null}

          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          New here?{" "}
          <Link href="/register" className="font-medium text-[color:var(--accent)]">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
