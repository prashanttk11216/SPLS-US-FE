import React from "react";
import { Controller } from "react-hook-form";
import "./NumberInput.scss";
import { formatNumber } from "../../../utils/numberUtils";

interface NumberInputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  control: any; // Replace with the actual type from react-hook-form
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  rules?: any;
  currencyOptions?: string[];
  currency?: boolean;
  defaultCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  numberFormatOptions?: Intl.NumberFormatOptions;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  id,
  name,
  placeholder,
  control,
  disabled = false,
  rules,
  currencyOptions = ["$", "€", "£", "₹"],
  defaultCurrency = "$",
  currency = false,
  onCurrencyChange,
}) => {
  const validationRules = {
    setValueAs: (value: any) => {
      const strValue = value?.toString().replace(/,/g, "") || "";
      return strValue === "" ? undefined : parseFloat(strValue);
    },
  };

  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onCurrencyChange?.(event.target.value);
  };
  rules = { ...rules, ...validationRules };
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
            <div className="input-group">
              {currency && currencyOptions && (
                <select
                  className="form-select form-select-lg currency-dropdown"
                  defaultValue={defaultCurrency}
                  onChange={handleCurrencyChange}
                  disabled={true}
                >
                  {currencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                className={`form-control form-control-lg ${
                  fieldState?.error ? "is-invalid" : ""
                }`}
                id={id}
                placeholder={placeholder}
                {...field}
                value={formatNumber(field.value)}
                onChange={(e) => {
                  const rawValue = e.target.value;
                
                  // Allow intermediate states like "-" or "" without processing them
                  if (rawValue === "-" || rawValue === "") {
                    field.onChange(rawValue); // Update raw value
                    return;
                  }
                
                  // Remove formatting and parse the number
                  const cleanedValue = rawValue.replace(/,/g, "");
                  const numberValue = parseFloat(cleanedValue);
                
                  // Only update with valid numbers or undefined if empty
                  if (!isNaN(numberValue)) {
                    field.onChange(numberValue);
                  }
                }}
              />
            </div>
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
