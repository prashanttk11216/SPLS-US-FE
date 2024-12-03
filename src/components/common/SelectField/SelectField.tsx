import React, { useEffect, useState } from "react";
import Select, { Props as SelectProps } from "react-select";
import { Controller } from "react-hook-form";
import { customSelectStyles, customSelectTheme } from "./selectStyles";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  name: string;
  options: SelectOption[];
  control: any;
  rules?: any;
  defaultValue?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  customStyles?: any;
  customTheme?: any;
  isLoading?: boolean; // For indicating loading state
} & Omit<SelectProps<SelectOption>, "name" | "options" | "defaultValue">;

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  options,
  control,
  rules,
  defaultValue,
  label,
  required,
  placeholder,
  customStyles = customSelectStyles,
  customTheme = customSelectTheme,
  isLoading = false,
  ...rest
}) => {
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    // Simulate async loading of options
    if (options?.length) {
      setFilteredOptions(options);
    }
  }, [options]);

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
              options={filteredOptions}
              placeholder={placeholder || (isLoading ? "Loading..." : "Select")}
              classNamePrefix="select"
              isLoading={isLoading} // Show loading spinner if applicable
              styles={{
                ...customStyles,
                control: (baseStyles) => ({
                  ...customStyles.control(baseStyles),
                  borderColor: fieldState?.invalid ? "red" : "#d9d9d9",
                }),
              }}
              theme={customTheme}
              onChange={(selectedOption: any) =>
                field.onChange(selectedOption?.value || "")
              }
              value={
                filteredOptions.find(
                  (option) => option.value === field.value
                ) || null
              }
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
