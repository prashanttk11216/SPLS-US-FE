import React from "react";
import {
  Controller,
  FieldErrors,
  Control,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import "./CheckboxField.scss";

interface CheckboxFieldProps {
  label: string;
  id: string;
  name: string;
  control: Control<any>; // Replace `any` with your form data type
  disabled?: boolean;
  rules?:
    | Omit<
        RegisterOptions<FieldValues, string>,
        "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
      >
    | undefined; // Additional validation rules from parent component
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Custom onChange handler
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  id,
  name,
  control,
  disabled = false,
  rules,
  onChange,
}) => {
  return (
    <div className="form-check">
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <div>
              <input
                type="checkbox"
                className={`form-check-input ${
                  fieldState?.error ? "is-invalid" : ""
                }`}
                id={id}
                disabled={disabled}
                {...field}
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e); // react-hook-form's onChange handler
                  onChange?.(e); // Custom onChange handler if provided
                }}
              />
              <label className="form-check-label" htmlFor={id}>
                {label}
                {rules?.required && " *"}
              </label>
            </div>
            {fieldState?.error && (
              <div className="text-danger">{fieldState?.error?.message}</div>
            )}
          </>
        )}
      />
      {/* {errors[name] && (
        <span className="text-danger">{errors[name]?.message}</span>
      )} */}
    </div>
  );
};

export default CheckboxField;
