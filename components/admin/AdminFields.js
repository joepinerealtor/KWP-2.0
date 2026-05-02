"use client";

export function AdminTextField({ disabled = false, label, onChange, value = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        disabled={disabled}
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

export function AdminTextArea({ disabled = false, label, onChange, value = "" }) {
  return (
    <label className="admin-field admin-field--full">
      <span>{label}</span>
      <textarea
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={3}
      />
    </label>
  );
}
