import React from "react";
import "./Input.scss";

interface InputProps {
  label: string;
  type?: string;
  id: string;
  name: string;
  placeholder?: string;
  register: any; // Replace with the actual type from react-hook-form
  errors: any; // Replace with the actual type from react-hook-form
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  preventNegative?: boolean;
  validateFun?: (val: string) => any;
  validationMessages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    min?: string;
    max?: string;
  };
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
  register,
  errors,
  errorMessage,
  required = false,
  disabled = false,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  preventNegative,
  validationMessages,
  validateFun,
  isTextArea = false,
  rows = 4,
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
    minLength: minLength && ({ value: minLength, message: validationMessages?.minLength || `Must be at least ${minLength} characters` }),
    maxLength: maxLength && ({ value: maxLength, message: validationMessages?.maxLength || `Cannot exceed ${maxLength} characters` }),
    pattern: pattern && ({ value: pattern, message: validationMessages?.pattern || `Must match the pattern ${pattern}` }),
    min: min && ({ value: min, message: validationMessages?.min || `Must be greater than or equal to ${min}` }),
    max: max && ({ value: max, message: validationMessages?.max || `Cannot be greater than ${max}` }),
    validate: validateFun,
    setValueAs: type === "number" ? (value: string) => (value === "" ? undefined : Number(value)) : undefined,
  };

  if (type === "number" && preventNegative) {
    validationRules.min = { value: 0, message: "Must be non-negative" };
  }

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCurrencyChange?.(event.target.value);
  };

  const formatNumber = (value: string) => {
    if (!value) return "";
    try {
      const number = parseFloat(value.replace(/,/g, ""));
      if (isNaN(number)) return value;
      console.log(new Intl.NumberFormat(locale, numberFormatOptions).format(number));
      
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
        {label}{required && " *"}
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
        {isTextArea ? (
          <textarea
            className={`form-control form-control-lg ${errors[name] ? "is-invalid" : ""}`}
            id={id}
            rows={rows}
            placeholder={placeholder}
            {...register(name, validationRules)}
            disabled={disabled}
          />
        ) : (
          <input
            type={type === "number" ?  "text" :  type}
            className={`form-control form-control-lg ${errors[name] ? "is-invalid" : ""}`}
            id={id}
            placeholder={placeholder}
            {...register(name, validationRules)}
            disabled={disabled}
            onChange={type === "number" ? handleInputChange : undefined}
          />
        )}
      </div>
      {errors[name] && <span className="text-danger">{errors[name].message}</span>}
    </div>
  );
};

export default Input;