import React from "react";
import './CheckboxField.scss';

interface CheckboxFieldProps {
  label: string;
  id: string;
  name: string;
  register: any; // Replace with the actual type from react-hook-form
  errors: any; // Replace with the actual type from react-hook-form
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  validationMessages?: {
    required?: string;
  };
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Custom onChange handler
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  id,
  name,
  register,
  errors,
  errorMessage,
  required = false,
  disabled = false,
  validationMessages,
  onChange,
}) => {
  const validationRules = {
    required: required && (errorMessage || validationMessages?.required || "This field is required"),
    disabled,
  };

  return (
    <div className="form-check">
      <input
        type="checkbox"
        className={`form-check-input ${errors[name] ? 'is-invalid' : ''}`}
        id={id}
        disabled={disabled}
        {...register(name, validationRules)}
        onChange={onChange} // Bind the custom onChange handler
      />
      <label className="form-check-label" htmlFor={id}>
        {label}{required && "*"}
      </label>
      <br/>
      {errors[name] && (
        <span className="text-danger">{errors[name].message}</span>
      )}
    </div>
  );
};

export default CheckboxField;
