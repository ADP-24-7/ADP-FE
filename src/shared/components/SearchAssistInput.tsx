import { Search } from 'lucide-react';
import { useId, useMemo, useState, type ChangeEvent, type FocusEvent } from 'react';

export type SearchSuggestion = {
  value: string;
  label?: string;
  description?: string;
  source?: 'api' | 'local-example';
};

type SearchAssistInputProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: ReadonlyArray<SearchSuggestion>;
  placeholder: string;
  ariaLabel: string;
  required?: boolean;
  disabled?: boolean;
  onSelect?: (suggestion: SearchSuggestion) => void;
};

function includesQuery(suggestion: SearchSuggestion, query: string) {
  return [suggestion.value, suggestion.label, suggestion.description]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
    .includes(query.toLocaleLowerCase());
}

export function SearchAssistInput({
  value,
  onChange,
  suggestions,
  placeholder,
  ariaLabel,
  required = false,
  disabled = false,
  onSelect,
}: SearchAssistInputProps) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const filteredSuggestions = useMemo(() => {
    const query = value.trim();
    return query ? suggestions.filter((suggestion) => includesQuery(suggestion, query)) : suggestions;
  }, [suggestions, value]);

  function change(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
    setOpen(true);
  }

  function blur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }

  function select(suggestion: SearchSuggestion) {
    onChange(suggestion.value);
    onSelect?.(suggestion);
    setOpen(false);
  }

  return (
    <div className="search-assist" onBlur={blur}>
      <div className="search-assist-control">
        <Search size={15} aria-hidden="true" />
        <input
          value={value}
          onChange={change}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-controls={listboxId}
          aria-expanded={open && filteredSuggestions.length > 0}
          aria-autocomplete="list"
          role="combobox"
          required={required}
          disabled={disabled}
        />
      </div>
      {open && !disabled ? (
        <div className="search-assist-menu" id={listboxId} role="listbox">
          <div className="search-assist-caption">
            <span>{value.trim() ? '검색 조건과 일치하는 항목' : '입력 가능한 예시'}</span>
            <small>선택하면 입력란에 적용됩니다</small>
          </div>
          {filteredSuggestions.length ? filteredSuggestions.map((suggestion) => (
            <button
              key={`${suggestion.source ?? 'option'}-${suggestion.value}`}
              type="button"
              role="option"
              aria-selected={suggestion.value === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(suggestion)}
            >
              <span>
                <strong>{suggestion.label ?? suggestion.value}</strong>
                {suggestion.label ? <code>{suggestion.value}</code> : null}
                {suggestion.description ? <small>{suggestion.description}</small> : null}
              </span>
              <em>{suggestion.source === 'api' ? 'API 결과' : 'LOCAL 예시'}</em>
            </button>
          )) : (
            <p className="search-assist-empty">일치하는 제안이 없습니다. 값을 직접 입력할 수 있습니다.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
