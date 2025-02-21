import React from "react";
import {
  Controller,
  Control,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
// import "./RadioField.scss";

interface RadioOption {
  label: string;
  value: any;
}

interface RadioGroupFieldProps {
  label: string;
  name: string;
  options: RadioOption[];
  control: Control<any>; // Replace `any` with your form data type
  disabled?: boolean;
  rules?: any
  onChange?: (value: string) => void;
  layout?: "horizontal" | "vertical"; // New prop for layout control
}

const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  label,
  name,
  options,
  control,
  disabled = false,
  rules,
  onChange,
  layout = "vertical", // Default layout is vertical
}) => {
  return (
    <div className={`radio-group ${layout}`}>
      <p>{label} {rules?.required && "*"}</p>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
            
            
          <div className={layout === "horizontal" ? "d-flex gap-3" : "d-flex flex-column gap-2"}>
            {options.map((option) => (
              <div key={option.value} className="form-check">
                <input
                  type="radio"
                  className={`form-check-input ${
                    fieldState?.error ? "is-invalid" : ""
                  }`}
                  id={`${name}-${option.value}`}
                  disabled={disabled}
                  checked={field.value === option.value}
                  {...field}
                  value={option.value} // Explicitly set value
                  onChange={() => {
                    field.onChange(option.value);
                    onChange?.(option.value);
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor={`${name}-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
            {fieldState?.error && (
              <div className="text-danger">{fieldState?.error?.message}</div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default RadioGroupField;
