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
  currencyOptions?: string[];
  currency?: boolean;
  defaultCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  numberFormatOptions?: Intl.NumberFormatOptions; // Options for number formatting
  locale?: string; // Locale for number formatting
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
  currencyOptions = ["$", "€", "£", "₹"],
  defaultCurrency = "$",
  currency = false,
  onCurrencyChange,
  numberFormatOptions = {},
  locale = "en-US",
}) => {
  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onCurrencyChange?.(event.target.value);
  };

  const formatNumber = (value: string) => {
    if (!value) return "";
    try {
      const number = parseFloat(value.replace(/,/g, ""));
      if (isNaN(number)) return value;
      return new Intl.NumberFormat(locale, numberFormatOptions).format(number);
    } catch {
      return value;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(event.target.value);
    event.target.value = formattedValue;
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}
        {rules?.required && " *"}
      </label>
      <div className="input-group">
        {type === "number" && currency && currencyOptions && (
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
                    onChange={(event) => {
                      field.onChange(event);
                      if (type === "number") handleInputChange(event);
                    }}
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
      {/* {errors[name] && <span className="text-danger">{errors[name].message}</span>} */}
    </div>
  );
};

export default Input;
