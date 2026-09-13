import React, { useState, useEffect } from 'react';

interface NumericInputProps {
  value: number;
  onChange: (val: number) => void;
  step?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  id?: string;
  fallbackValue?: number;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  id,
  fallbackValue = 0,
}) => {
  const [text, setText] = useState<string>(() =>
    value === 0 && placeholder ? '' : value.toString()
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync external value changes when input is not focused
  useEffect(() => {
    if (!isFocused) {
      setText(value === 0 && placeholder ? '' : value.toString());
    }
  }, [value, isFocused, placeholder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty string, single minus, or valid float/intermediate (e.g. "19.", "0.")
    if (raw === '' || raw === '-' || raw === '.' || /^-?\d*\.?\d*$/.test(raw)) {
      setText(raw);

      if (raw === '' || raw === '-' || raw === '.') {
        // Keep intermediate text, send fallbackValue to parent
        onChange(fallbackValue);
        return;
      }

      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setText(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (text.trim() === '' || text === '-' || text === '.' || isNaN(parseFloat(text))) {
      const fb = fallbackValue ?? 0;
      setText(fb.toString());
      onChange(fb);
    } else {
      const parsed = parseFloat(text);
      setText(parsed.toString());
      onChange(parsed);
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={isFocused ? text : (value === 0 && placeholder ? '' : value.toString())}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      autoComplete="off"
    />
  );
};
