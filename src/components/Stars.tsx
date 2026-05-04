export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  const v = Math.max(0, Math.min(max, value));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = max - full - (half ? 1 : 0);
  return (
    <span className="star-row" aria-label={`${v.toFixed(1)} out of ${max}`}>
      {"★".repeat(full)}
      {half ? "⯨" : ""}
      <span className="text-ink/20">{"★".repeat(empty)}</span>
    </span>
  );
}

export function StarInput({
  name,
  defaultValue = 0,
  label,
}: {
  name: string;
  defaultValue?: number;
  label: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} defaultValue={defaultValue} className="select" required>
        <option value="">— pick —</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)} ({n})
          </option>
        ))}
      </select>
    </div>
  );
}
