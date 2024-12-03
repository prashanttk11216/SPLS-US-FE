import React from "react";
import { Controller } from "react-hook-form";
import "./NumberInput.scss";

interface NumberInputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  control: any; // Replace with the actual type from react-hook-form
  errors: any; // Replace with the actual type from react-hook-form
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  preventNegative?: boolean;
  validationMessages?: {
    required?: string;
    min?: string;
    max?: string;
  };
  currencyOptions?: string[];
  currency?: boolean;
  defaultCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  numberFormatOptions?: Intl.NumberFormatOptions;
  locale?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  id,
  name,
  placeholder,
  control,
  errors,
  errorMessage,
  required = false,
  disabled = false,
  min,
  max,
  preventNegative = false,
  validationMessages,
  currencyOptions = ["$", "€", "£", "₹"],
  defaultCurrency = "$",
  currency = false,
  onCurrencyChange,
  numberFormatOptions = {},
  locale = "en-US",
}) => {
  const validationRules = {
    required: required && (errorMessage || validationMessages?.required || "This field is required"),
    disabled,
    min: min && ({
      value: min,
      message: validationMessages?.min || `Must be greater than or equal to ${min}`,
    }),
    max: max && ({
      value: max,
      message: validationMessages?.max || `Cannot be greater than ${max}`,
    }),
    setValueAs: (value: any) => {
      const strValue = value?.toString().replace(/,/g, "") || "";
      return strValue === "" ? undefined : parseFloat(strValue);
    },
  };

  if (preventNegative) {
    validationRules.min = { value: 0, message: "Must be non-negative" };
  }

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCurrencyChange?.(event.target.value);
  };

  const formatNumber = (value: number | string) => {
    if (value === undefined || value === null || value === "") return "";
    const number = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(number)) return value;
    return new Intl.NumberFormat(locale, numberFormatOptions).format(number);
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}
        {required && " *"}
      </label>
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
        <Controller
          name={name}
          control={control}
          disabled={disabled}
          render={({ field }) => (
            <input
              type="text"
              className={`form-control form-control-lg ${errors[name] ? "is-invalid" : ""}`}
              id={id}
              placeholder={placeholder}
              value={formatNumber(field.value)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              disabled={field.disabled}
              onChange={(e) => {
                // Remove formatting for internal state and update raw number value
                const rawValue = e.target.value.replace(/,/g, "");
                const numberValue = parseFloat(rawValue);
                if (!isNaN(numberValue) || rawValue === "") {
                  field.onChange(rawValue === "" ? undefined : numberValue); // Update with raw value or undefined if empty
                }
              }}
            />
          )}
          rules={validationRules}
        />
      </div>
      {errors[name] && <span className="text-danger">{errors[name].message}</span>}
    </div>
  );
};

export default NumberInput;
