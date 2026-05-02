"use client";

export function FormField({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-sub)", letterSpacing: "0.01em" }}>
        {label}
      </span>
      {children}
      {error ? (
        <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>
      ) : null}
    </label>
  );
}

const inputStyle = {
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.12s",
  width: "100%",
};

export function TextInput({ register, name, type = "text", ...rest }) {
  return (
    <input
      type={type}
      {...register(name)}
      {...rest}
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
    />
  );
}

export function PrimaryButton({ children, disabled, style = {}, ...rest }) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        padding: "8px 18px",
        borderRadius: 10,
        background: "var(--accent, #7c5cfc)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
