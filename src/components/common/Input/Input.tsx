import React, { useState } from "react";
import { Controller } from "react-hook-form";
import "./Input.scss";
import EyeSlash from "../../../assets/icons/eyeSlash.svg";
import Eye from "../../../assets/icons/eye.svg";

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
  showEyeIcon?: boolean;
  rows?: number;
  isOnlyLowerCase?: boolean;
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
  showEyeIcon = false,
  rows = 4,
  isOnlyLowerCase = false
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label text-dark-blue">
        {label}
        {rules?.required && " *"}
      </label>
      <div>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }) => (
            <>
              <div
                className={`flex-grow-1 ${
                  showEyeIcon ? "position-relative" : ""
                }`}
              >
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
                    value={field.value || ""} // Ensure controlled behavior
                  />
                ) : (
                  <div className={`${showEyeIcon ? "position-relative" : ""}`}>
                    <input
                      type={
                        showEyeIcon
                          ? isPasswordVisible
                            ? "text"
                            : "password"
                          : type ?? "text"
                      }
                      className={`form-control form-control-lg ${
                        fieldState?.error
                          ? `is-invalid ${showEyeIcon ? "with-icon" : ""}`
                          : ""
                      }`}
                      id={id}
                      placeholder={placeholder}
                      disabled={disabled}
                      {...field}
                      value={field.value || ""} // Ensure controlled behavior
                      onChange={(e) =>
                        field.onChange(
                          isOnlyLowerCase ? e.target.value.toLowerCase() : e.target.value
                        )
                      }
                    />
                    {showEyeIcon && (
                      <span
                        className="password-toggle-icon"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={{
                          position: "absolute",
                          right: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                        }}
                      >
                        {isPasswordVisible ? (
                          <img
                            src={EyeSlash}
                            alt="eye"
                            height={22}
                            width={22}
                          />
                        ) : (
                          <img src={Eye} alt="eye" height={22} width={22} />
                        )}
                      </span>
                    )}
                  </div>
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
    </div>
  );
};

export default Input;
