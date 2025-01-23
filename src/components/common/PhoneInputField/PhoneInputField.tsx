import React from "react";
import { Controller, Control } from "react-hook-form";
import { PhoneInput } from "react-international-phone";

interface PhoneInputFieldProps {
  label: string;
  name: string;
  control: Control<any>; // Replace `any` with your form data type
  defaultCountry?: string;
  rules?: any;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  name,
  control,
  defaultCountry = "us",
  rules,
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
        render={({ field, fieldState }) => (
          <>
            <PhoneInput
              {...field}
              defaultCountry={defaultCountry}
              className={fieldState?.error ? "phone-is-invalid" : ""}
              inputClassName={`w-100 phone-input form-control ${
                fieldState?.error ? "is-invalid" : ""
              }`}
              onChange={(phone) => field.onChange(phone)} // Update the value in react-hook-form
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

export default PhoneInputField;
