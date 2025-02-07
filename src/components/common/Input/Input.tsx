import React from "react";
import { Controller } from "react-hook-form";
import "./Input.scss";

interface InputProps {
  label: string;
  type?: string;
  id: string;
  name: string;
  placeholder?: string;
  control: any; // Replace with the actual type from react-hook-form
  disabled?: boolean;
  rules?: any; // Additional validation rules from parent component
  isOnlyLowerCase?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  id,
  name,
  placeholder,
  control,
  disabled = false,
  rules,
  isOnlyLowerCase = false,
}) => {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}
        {rules?.required && " *"}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        disabled={disabled}
        render={({ field, fieldState }) => (
          <>
            <input
              type={type ?? "text"}
              className={`form-control form-control-lg ${
                fieldState?.error ? `is-invalid` : ""
              }`}
              id={id}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value || ""} // Ensure controlled behavior
              onChange={(e) =>
                field.onChange(
                  isOnlyLowerCase
                    ? e.target.value.toLowerCase()
                    : e.target.value
                )
              }
            />
            {fieldState?.error && (
              <div className="text-danger">{fieldState?.error?.message}</div>
            )}
          </>
        )}
      />
    </div>
  );
};

export default Input;
