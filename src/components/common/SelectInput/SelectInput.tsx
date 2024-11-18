import React from "react";
import './SelectInput.scss';

interface SelectProps {
  label: string;
  id: string;
  name: string;
  options: { value: string; label: string }[];
  register: any; // Replace with the actual type from react-hook-form
  errors: any; // Replace with the actual type from react-hook-form
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  validationMessages?: {
    required?: string;
  };
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
  validationMessages,
}) => {
  const validationRules = {
    required: required && (errorMessage || validationMessages?.required || "This field is required"),
    disabled,
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select
        id={id}
        className={`form-select form-select-lg ${errors[name] ? 'is-invalid' : ''}`}
        disabled={disabled}
        {...register(name, validationRules)}
      >
        <option value="">Select an option</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <span className="text-danger">{errors[name].message}</span>
      )}
    </div>
  );
};

export default Select;
