import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Tìm kiếm...",
  debounce = 300,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounce);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-300 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-300 hover:text-coffee-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
