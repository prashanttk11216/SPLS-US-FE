import React, { useState, useEffect } from "react";
import "./SearchBar.scss";
import useDebounce from "../../../hooks/useDebounce";
import SearchIcon from "../../../assets/icons/Search.svg";

interface SearchBarProps {
  onSearch: (query: string) => void; // Function to handle search
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState<string>(""); // Local state for input
  const debouncedValue = useDebounce(inputValue, 500); // Debounce input value with 500ms delay

  // Trigger `onSearch` with the debounced value
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="search-bar-container">
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
  );
};

export default SearchBar;
