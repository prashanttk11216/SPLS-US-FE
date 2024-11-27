import { StylesConfig, ThemeConfig } from "react-select";
import { SelectOption } from "./SelectField"; // Import SelectOption type if reused

// Define custom styles
export const customSelectStyles: StylesConfig<SelectOption, false> = {
  control: (base) => ({
    ...base,
    height: 48,
    borderWidth: "1px",
    borderRadius: "0.5rem",
    boxShadow: "none",
    fontFamily: "'Inter', sans-serif",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#2a4459",
    opacity: 0.7,
    fontSize: 14,
  }),
};

// Define custom theme
export const customSelectTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary: "#d9d9d9",
  },
});
