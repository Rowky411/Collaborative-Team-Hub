"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../lib/stores/authStore";
import { FormField, TextInput, PrimaryButton } from "../../../components/ui/FormField";

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
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
    const result = await registerUser({
      email: values.email,
      name: values.name,
      password: values.password,
    });
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
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-[color:var(--muted)]">Start collaborating with your team</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Name" error={errors.name?.message}>
            <TextInput
              register={register}
              name="name"
              autoComplete="name"
              {...register("name", { required: "Name is required" })}
            />
          </FormField>

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
              autoComplete="new-password"
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
            {submitting ? "Creating account…" : "Create account"}
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[color:var(--accent)]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
