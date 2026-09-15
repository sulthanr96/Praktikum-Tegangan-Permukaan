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
    value === 0 ? '' : value.toString()
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setText(value === 0 ? '' : value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-' || raw === '.' || /^-?\d*\.?\d*$/.test(raw)) {
      setText(raw);
      if (raw === '' || raw === '-' || raw === '.') {
        onChange(0);
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
    setText(value === 0 ? '' : value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (text.trim() === '' || text === '-' || text === '.' || isNaN(parseFloat(text))) {
      setText('');
      onChange(0);
    } else {
      const parsed = parseFloat(text);
      setText(parsed === 0 ? '' : parsed.toString());
      onChange(parsed);
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      placeholder={placeholder || (value === 0 ? '' : undefined)}
      className={className}
      value={isFocused ? text : (value === 0 ? '' : value.toString())}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      autoComplete="off"
    />
  );
};
