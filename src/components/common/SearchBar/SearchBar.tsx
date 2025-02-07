import React, { useState, useEffect, useDeferredValue } from "react";
import "./SearchBar.scss";
import SearchIcon from "../../../assets/icons/Search.svg";
import SelectField, { SelectOption } from "../SelectField/SelectField";
import { useForm } from "react-hook-form";

interface SearchBarProps {
  searchFieldOptions: { label: string; value: string }[];
  onSearchFieldChange: (selectedOption: SelectOption) => void;
  defaultField: string;
  onSearch: (query: string) => void; // Function to handle search
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchFieldOptions,
  defaultField,
  onSearchFieldChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(""); // Local state for input
  const deferredValue = useDeferredValue(inputValue); // Deferred input value

  const { control } = useForm<any>({
    mode: "onBlur",
  });

  // Trigger `onSearch` with the deferred value
  useEffect(() => {
    onSearch(deferredValue);
  }, [deferredValue]);

  return (
    <div className="d-flex">
      <div className="search-field">
        <SelectField
          label=""
          name="searchField"
          placeholder="Select Field"
          control={control}
          options={searchFieldOptions}
          defaultValue={defaultField}
          onChangeOption={onSearchFieldChange}
        />
      </div>
      <div className="search-bar-container ms-2">
        <img
          src={SearchIcon}
          alt="Search"
          className="search-bar-icon"
          width={20}
          height={20}
        />
        <input
          type="text"
          className="search-bar-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Update local state
          placeholder="Search"
        />
      </div>
    </div>
  );
};

export default SearchBar;
