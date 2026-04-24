import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
};

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs text-white/38">{hint}</span> : null}
      {error ? <span className="text-xs text-rose">{error}</span> : null}
    </label>
  );
}

const inputClasses =
  "min-h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-medium text-white outline-none transition placeholder:text-white/28 focus:border-violet-300/40";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

export function TextInput({ label, hint, error, className = "", ...props }: TextInputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <input className={`${inputClasses} ${className}`} {...props} />
    </FieldShell>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

export function TextareaField({
  label,
  hint,
  error,
  className = "",
  ...props
}: TextareaFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <textarea
        className={`${inputClasses} min-h-28 resize-y py-3 ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string | null;
  options: Array<{ label: string; value: string }>;
};

export function SelectField({
  label,
  hint,
  error,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <select className={`${inputClasses} ${className}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
