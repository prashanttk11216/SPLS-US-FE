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
  isRange?: boolean; // Flag to toggle range functionality
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
  isRange = false,
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
              selected={parseDate((isRange ? field.value?.[0] : field?.value)|| null)} // Start date for range or single date
              // onChange={field.onChange}
              onChange={(dates: any) => {
                if (isRange && Array.isArray(dates)) {
                  field.onChange(dates); // Pass the range to react-hook-form
                } else {
                  field.onChange(dates ? dates.toISOString() : ""); // Pass a single date
                }
              }}
              ref={field.ref}
              onBlur={field.onBlur}
              startDate={field.value?.[0] || null} // Start date
              endDate={field.value?.[1] || null} // End date
              disabled={field.disabled}
              name={field.name}
              className={`form-control form-control-lg ${
                fieldState?.invalid ? "is-invalid" : ""
              }`} 
              placeholderText={placeholder}
              autoComplete="off"
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
