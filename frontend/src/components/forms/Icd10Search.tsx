import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import type { Icd10Entry, Icd10Item } from "../../types";

interface Icd10SearchProps {
  selected: Icd10Entry[];
  onChange: (entries: Icd10Entry[]) => void;
}

function isSelected(list: Icd10Entry[], code: string) {
  return list.some((entry) => entry.code?.toUpperCase() === code.toUpperCase());
}

export function Icd10Search({ selected, onChange }: Icd10SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Icd10Item[]>([]);
  const [suggestions, setSuggestions] = useState<Icd10Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getIcd10Suggestions().then(setSuggestions).catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      api
        .searchIcd10(q)
        .then((res) => {
          setResults(res.results);
          setActiveIndex(res.results.length > 0 ? 0 : -1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addEntry = useCallback(
    (item: Icd10Item) => {
      if (isSelected(selected, item.code)) return;
      onChange([...selected, { code: item.code, description: item.name }]);
      setQuery("");
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange, selected],
  );

  const removeEntry = (code: string) => {
    onChange(selected.filter((entry) => entry.code?.toUpperCase() !== code.toUpperCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      addEntry(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="icd10-search">
      {suggestions.length > 0 && (
        <div className="icd10-search__suggestions">
          <span className="icd10-search__suggestions-label">Частые для неврологии:</span>
          <div className="icd10-search__suggestions-row">
            {suggestions.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`icd-chip ${isSelected(selected, item.code) ? "icd-chip--active" : ""}`}
                title={item.name}
                onClick={() => addEntry(item)}
              >
                {item.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="icd10-search__field-wrap" ref={wrapRef}>
        <div className="icd-search icd10-search__field">
          <span className="icd-search__icon">🔍</span>
          <input
            className="icd-search__input"
            placeholder="Поиск по коду или названию (МКБ-10)…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {loading && <span className="icd10-search__spinner">…</span>}
        </div>

        {showDropdown && (
          <ul className="icd10-search__dropdown" role="listbox">
            {results.length === 0 && !loading ? (
              <li className="icd10-search__dropdown-empty">Ничего не найдено</li>
            ) : (
              results.map((item, index) => (
                <li key={item.code}>
                  <button
                    type="button"
                    className={`icd10-search__option ${index === activeIndex ? "icd10-search__option--active" : ""} ${isSelected(selected, item.code) ? "icd10-search__option--picked" : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addEntry(item)}
                    disabled={isSelected(selected, item.code)}
                  >
                    <span className="icd10-search__option-code">{item.code}</span>
                    <span className="icd10-search__option-name">{item.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="icd10-search__selected">
          {selected.map((entry) => (
            <li key={entry.code} className="icd10-search__selected-item">
              <div className="icd10-search__selected-main">
                <span className="icd10-search__selected-code">{entry.code}</span>
                <span className="icd10-search__selected-name">
                  {entry.description || "Без описания"}
                </span>
              </div>
              <button
                type="button"
                className="icd10-search__selected-remove"
                aria-label={`Удалить ${entry.code}`}
                onClick={() => removeEntry(entry.code ?? "")}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
