import React, { useState } from "react";
import { Controller } from "react-hook-form";
import "./PasswordInput.scss";
import EyeSlash from "../../../assets/icons/eyeSlash.svg";
import Eye from "../../../assets/icons/eye.svg";

interface PasswordInputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  control: any; // Replace with the actual type from react-hook-form
  disabled?: boolean;
  rules?: any; // Additional validation rules from parent component
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  id,
  name,
  placeholder,
  control,
  disabled = false,
  rules,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}
        {rules?.required && " *"}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        disabled={disabled}
        render={({ field, fieldState }) => (
          <>
            <div className={`position-relative`}>
              <input
                type={isPasswordVisible ? "text" : "password"}
                className={`form-control form-control-lg ${
                  fieldState?.error ? `is-invalid  with-icon` : ""
                }`}
                id={id}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <img
                  src={isPasswordVisible ? EyeSlash : Eye}
                  alt="eye"
                  height={22}
                  width={22}
                />
              </span>
            </div>
            {fieldState?.error && (
              <span className="text-danger">{fieldState?.error?.message}</span>
            )}
          </>
        )}
      />
    </div>
  );
};

export default PasswordInput;
