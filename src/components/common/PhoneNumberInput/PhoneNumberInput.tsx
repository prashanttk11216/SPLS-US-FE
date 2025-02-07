import React from "react";
import { Controller, Control } from "react-hook-form";
import { PhoneInput } from "react-international-phone";

interface PhoneNumberInputProps {
  label: string;
  name: string;
  disabled?: boolean;
  control: Control<any>; // Replace `any` with your form data type
  defaultCountry?: string;
  rules?: any;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  name,
  control,
  defaultCountry = "us",
  rules,
  disabled = false,
}) => {
  return (
    <div className="form-group">
      <label className="form-label text-dark-blue">
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
            <PhoneInput
              {...field}
              defaultCountry={defaultCountry}
              className={fieldState?.error ? "phone-is-invalid" : ""}
              inputClassName={`w-100 phone-input form-control ${
                fieldState?.error ? "is-invalid" : ""
              }`}
            />
            {fieldState.error && (
              <div className="text-danger">{fieldState?.error?.message}</div>
            )}
          </>
        )}
      />
    </div>
  );
};

export default PhoneNumberInput;
