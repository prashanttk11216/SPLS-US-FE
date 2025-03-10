import React from "react";
import { Controller } from "react-hook-form";
import "./NumberInput.scss";
import { formatNumber } from "../../../utils/numberUtils";

interface NumberInputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  decimalPlaces?: number;
  control: any; // Replace with the actual type from react-hook-form
  disabled?: boolean;
  rules?: any;
  format?: boolean
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  id,
  name,
  placeholder,
  control,
  decimalPlaces = 2,
  disabled = false,
  rules,
  format = false
}) => {

  return (
    <div className="mb-3">
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
        disabled={disabled}
        render={({ field, fieldState }) => (
          <>
            <input
              type="text"
              className={`form-control form-control-lg ${
                fieldState?.error ? "is-invalid" : ""
              }`}
              id={id}
              placeholder={placeholder}
              {...field}
              disabled={disabled}
              value={format ? (formatNumber(field.value) ?? "") : (field.value ?? "")} // Ensures a controlled value
              onChange={(e) => {
                let value = e.target.value;
                if (value.trim() === "") {
                  field.onChange("");
                  return;
                }
                const lastChar = value.charAt(value.length - 1); // Get only the last typed character

                // Allow only valid characters
                value = value.replace(/[^0-9.-]/g, "");
                // Ensure only one decimal point
                value = value.replace(/(\.)(?=.*\.)/g, "");
                // Ensure only one negative sign at the start
                value = value.replace(/(?!^)-/g, "");

                // Ensures that when a user inputs a decimal number, it doesn't exceed the allowed number of decimal places.
                if (value && value.includes(".")) {
                  const [intPart, decimalPart] = value.split(".");
                  value = `${intPart}.${decimalPart.slice(0, decimalPlaces)}`;
                }

                if(lastChar === "." || lastChar === "-") {
                  field.onChange(value ?  value : undefined);
                }else{
                  field.onChange(value ?  parseFloat(value) : undefined);
                }
              }}
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

export default NumberInput;
