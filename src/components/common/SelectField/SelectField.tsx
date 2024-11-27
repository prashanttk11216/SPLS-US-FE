import React from "react";
import Select, { Props as SelectProps } from "react-select";
import { Controller } from "react-hook-form";
import { customSelectStyles, customSelectTheme } from "./selectStyles";

// Define the structure for a select option
export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  name: string; // Name of the field in the form
  options: SelectOption[]; // Options for the select dropdown
  control: any; // React Hook Form's control object
  rules?: any; // Validation rules from react-hook-form
  defaultValue?: string;
  label?: string; // Field label
  required?: boolean; // Whether the field is required
  placeholder?: string; // Placeholder text
  customStyles?: any; // Custom styles for react-select
  customTheme?: any; // Custom theme for react-select
} & Omit<SelectProps<SelectOption>, "name" | "options" | "defaultValue">; // Allow all other props for Select

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  options,
  control,
  rules,
  defaultValue,
  label,
  required,
  placeholder,
  customStyles = customSelectStyles, // Default to predefined styles
  customTheme = customSelectTheme, // Default to predefined theme
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="form-label text-dark-blue">
          {label}
          {required && " *"}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ""}
        rules={rules}
        render={({ field, fieldState }) => (
          <div>
            <Select
              {...field}
              options={options}
              placeholder={placeholder}
              classNamePrefix="select"
              styles={{
                ...customStyles,
                control: (baseStyles) => ({
                  ...customStyles.control(baseStyles),
                  borderColor: fieldState?.invalid ? "red" : "#d9d9d9",
                }),
              }}
              theme={customTheme}
              {...rest}
            />
            {fieldState?.error && (
              <span className="text-danger">{fieldState?.error?.message}</span>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SelectField;
