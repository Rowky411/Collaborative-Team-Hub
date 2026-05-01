"use client";

export function FormField({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function TextInput({ register, name, type = "text", ...rest }) {
  return (
    <input
      type={type}
      {...register(name)}
      {...rest}
      className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
    />
  );
}

export function PrimaryButton({ children, disabled, ...rest }) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
