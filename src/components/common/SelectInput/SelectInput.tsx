import React from "react";
import './SelectInput.scss';

interface SelectProps {
  label: string;
  id: string;
  name: string;
  options: { value: any; label: string }[];
  register?: any; // Replace with the actual type from react-hook-form
  errors?: any; // Replace with the actual type from react-hook-form
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  validationMessages?: {
    required?: string;
  };
  value?: any;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  showDefaultOption?: boolean; // New flag to show/hide "Select an option"
  defaultOptionText?: string; // Customizable text for the default option
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  name,
  options,
  register,
  errors,
  errorMessage,
  required = false,
  disabled = false,
  multiple = false,
  validationMessages,
  value,
  onChange,
  showDefaultOption = true, // Default to true for backward compatibility
  defaultOptionText = "Select an option", // Default text for the option
}) => {
  const validationRules = {
    required: required && (errorMessage || validationMessages?.required || "This field is required"),
    disabled,
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select
        id={id}
        name={name}
        className={`form-select form-select-lg ${errors?.[name] ? 'is-invalid' : ''}`}
        disabled={disabled}
        multiple={multiple}
        value={value}
        onChange={handleChange}
        {...(register ? register(name, validationRules) : {})}
      >
        {showDefaultOption && !multiple && (
          <option value="">{defaultOptionText}</option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors?.[name] && (
        <span className="text-danger">{errors[name].message}</span>
      )}
    </div>
  );
};

export default Select;
