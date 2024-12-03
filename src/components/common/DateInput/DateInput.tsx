import React from "react";
import DatePicker, { DatePickerProps } from "react-datepicker";
import { Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";

type DateInputProps = {
  name: string; // Field name for react-hook-form
  control: any; // React Hook Form's control object
  label?: string; // Field label
  required?: boolean; // Whether the field is required
  rules?: any; // Validation rules from react-hook-form
  placeholder?: string; // Placeholder text
  errorMessage?: string; // Error message to display
  datePickerProps?: DatePickerProps; // Props for the DatePicker
}; // Allow all other props for DatePicker

const DateInput: React.FC<DateInputProps> = ({
  name,
  control,
  label,
  required,
  rules,
  placeholder = "Choose Date",
  errorMessage,
  datePickerProps,
}) => {

  const parseDate = (value: any) => {
    if (value) {
      return new Date(value);
    }
    return null;
  };
  return (
    <div className="form-group">
      {label && (
        <label className="form-label text-dark-blue">
          {label}
          {required && " *"}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <div>
            <DatePicker
              {...datePickerProps}
              selected={parseDate(field.value)}
              // onChange={field.onChange}
              onChange={(date: any) => {
                // Convert Date to string before passing it to react-hook-form
                field.onChange(date ? date.toISOString() : "");
              }}
              ref={field.ref}
              onBlur={field.onBlur}
              disabled={field.disabled}
              name={field.name}
              className={`form-control form-control-lg ${
                fieldState?.invalid ? "is-invalid" : ""
              }`} 
              placeholderText={placeholder}
            />
            {fieldState?.error && (
              <span className="text-danger">
                {errorMessage || fieldState?.error?.message}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default DateInput;
