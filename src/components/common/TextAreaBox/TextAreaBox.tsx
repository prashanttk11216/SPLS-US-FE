import React from "react";
import { Controller } from "react-hook-form";
import "./TextAreaBox.scss";

interface TextAreaBoxProps {
  label?: string;
  id: string;
  name: string;
  placeholder?: string;
  control: any;
  disabled?: boolean;
  rules?: any;
  rows?: number;
  className?: string;
  maxLength?: number;
  autoResize?: boolean;
  showCharacterCount?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const TextAreaBox: React.FC<TextAreaBoxProps> = ({
  label,
  id,
  name,
  placeholder,
  control,
  disabled = false,
  rules,
  rows = 4,
  className = "",
  maxLength,
  autoResize = false,
  showCharacterCount = false,
  onChange,
  onBlur,
}) => {
  return (
    <div className={`textarea-box-container mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label text-dark-blue">
          {label}
          {rules?.required && " *"}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <textarea
              {...field}
              className={`form-control form-control-lg ${
                fieldState?.error ? "is-invalid" : ""
              }`}
              id={id}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              ref={(e) => {
                field.ref(e); // Assigns ref from react-hook-form
                if (autoResize && e) {
                  e.style.height = "auto";
                  e.style.height = `${e.scrollHeight}px`;
                }
              }}
              onChange={(e) => {
                field.onChange(e);
                if (autoResize) {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }
                onChange?.(e.target.value);
              }}
              onBlur={(e) => {
                field.onBlur();
                onBlur?.(e.target.value);
              }}
            />

            {showCharacterCount && maxLength && (
              <div className="text-muted small text-end">
                {field.value?.length || 0} / {maxLength}
              </div>
            )}

            {fieldState?.error && (
              <div className="text-danger">{fieldState.error.message}</div>
            )}
          </>
        )}
      />
    </div>
  );
};

export default TextAreaBox;
