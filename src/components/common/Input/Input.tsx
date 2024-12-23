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
  isTextArea?: boolean;
  rows?: number;
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
  isTextArea = false,
  rows = 4,
}) => {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}
        {rules?.required && " *"}
      </label>
      <div>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }) => (
            <>
              <div className="flex-grow-1">
                {isTextArea ? (
                  <textarea
                    className={`form-control form-control-lg ${
                      fieldState?.error ? "is-invalid" : ""
                    }`}
                    id={id}
                    rows={rows}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...field}
                    value={field.value || ""} // Ensure controlled behavior
                  />
                ) : (
                  <input
                    type={type === "number" ? "text" : type}
                    className={`form-control form-control-lg ${
                      fieldState?.error ? "is-invalid" : ""
                    }`}
                    id={id}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...field}
                    value={field.value || ""} // Ensure controlled behavior
                  />
                )}
                {fieldState?.error && (
                  <div className="text-danger">
                    {fieldState?.error?.message}
                  </div>
                )}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default Input;
