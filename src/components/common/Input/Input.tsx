import React from "react";
import './Input.scss';

interface InputProps {
  label: string;
  type: string;
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
  validateFun?: (val: string) => any
  validationMessages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    min?: string;
    max?: string;
  };
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
  validateFun
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
  };

  // console.log(validationRules);
  

  if (type === "number" && preventNegative) {
    validationRules.min = { value: 0, message: "Must be non-negative" };
  }

  if (type === "number" && min !== undefined) {
    validationRules.min = ({ value: min, message: validationMessages?.min || `Must be greater than or equal to ${min}` })
  }

  if (type === "number" && max !== undefined) {
    validationRules.max = ({ value: max, message: validationMessages?.max || `Cannot be greater than ${max}` })
  }

  return (
    <div className="mb-2">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}{required && "*"}
      </label>
      <input
        type={type}
        className={`form-control form-control-lg ${errors[name] ? 'is-invalid': ''}`}
        id={id}
        placeholder={placeholder}
        {...register(name, validationRules)}
      />
      {errors[name] && (
        <span className="text-danger">{errors[name].message}</span>
      )}
    </div>
  );
};

export default Input;