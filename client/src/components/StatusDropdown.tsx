interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
}

export default function StatusDropdown({ value, options, onChange, className = '' }: StatusDropdownProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`input ${className}`}>
      {options.map((o) => (
        <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
      ))}
    </select>
  );
}
