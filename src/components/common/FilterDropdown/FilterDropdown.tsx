import React from "react";
import closeLogo from "../../../assets/icons/closeLogo.svg";
import FilterShape from "../../../assets/icons/Filter.svg";
import "./FilterDropdown.scss";

interface FilterDropdownProps {
  statusFilter: "Active" | "Inactive" | null;
  sortFilter: string | null;
  sortOrder: "asc" | "desc";
  onStatusFilterChange: (status: "Active" | "Inactive" | null) => void;
  onSortFilterChange: (sort: string, order: "asc" | "desc") => void;
  onClearFilters: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  statusFilter,
  sortFilter,
  sortOrder,
  onStatusFilterChange,
  onSortFilterChange,
  onClearFilters,
}) => {
  const handleCloseDropdown = () => {
    const dropdownMenu = document.getElementById("filterList");
    dropdownMenu?.classList.remove("show"); // Close the dropdown
  };

  const handleSortClick = (column: string) => {
    const newOrder =
      sortFilter === column && sortOrder === "asc" ? "desc" : "asc";
    onSortFilterChange(column, newOrder);
  };

  const handleSortFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const column = e.target.value;
    const newOrder =
      sortFilter === column && sortOrder === "asc" ? "desc" : "asc";
    onSortFilterChange(column, newOrder);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-primary dropdown-toggle"
        type="button"
        id="sortDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img src={FilterShape} alt="FilterShape" height={20} width={20} />
        <span className="filter-btn">Filter</span>
      </button>
      <ul
        className="dropdown-menu mt-3"
        aria-labelledby="sortDropdown"
        id="filterList"
      >
        <div className="d-flex justify-content-between align-items-center form-check">
          <span className="filterByStatustext">Filter by Status:</span>
          <img
            className="close-Img"
            src={closeLogo}
            alt="Close"
            onClick={handleCloseDropdown}
          />
        </div>
        <li>
          <label className="filter-label d-flex align-items-center w-100 form-check">
            <span className="filter-text">Active</span>
            <input
              type="radio"
              name="statusFilter"
              value="Active"
              checked={statusFilter === "Active"}
              onChange={() => onStatusFilterChange("Active")}
              className="ms-auto me-4 form-check-input"
            />
          </label>
        </li>
        <li>
          <label className="filter-label d-flex align-items-center w-100 form-check">
            <span className="filter-text">Inactive</span>
            <input
              type="radio"
              name="statusFilter"
              value="Inactive"
              checked={statusFilter === "Inactive"}
              onChange={() => onStatusFilterChange("Inactive")}
              className="ms-auto me-4 form-check-input"
            />
          </label>
        </li>
        <div className="d-flex justify-content-between align-items-center form-check">
          <span className="sortBytext">Sort by:</span>
        </div>
        <li>
          <label className="filter-label d-flex align-items-center w-100 form-check">
            <span
              className="filter-text"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSortClick("firstName");
              }}
            >
              First Name (
              {sortFilter === "firstName" ? sortOrder.toUpperCase() : "ASC"})
            </span>
            <input
              type="radio"
              name="sortFilter"
              value="firstName"
              checked={sortFilter === "firstName"}
              onChange={handleSortFilterChange}
              className="ms-auto me-4 form-check-input"
            />
          </label>
        </li>
        <li>
          <label className="filter-label d-flex align-items-center w-100 form-check">
            <span
              className="filter-text"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSortClick("lastName");
              }}
            >
              Last Name (
              {sortFilter === "lastName" ? sortOrder.toUpperCase() : "ASC"})
            </span>
            <input
              type="radio"
              name="sortFilter"
              value="lastName"
              checked={sortFilter === "lastName"}
              onChange={handleSortFilterChange}
              className="ms-auto me-4 form-check-input"
            />
          </label>
        </li>
        <div className="dropdown-divider"></div>
        <li className="text-center mt-2">
          <button className="btn btn-sm btn-secondary" onClick={onClearFilters}>
            Clear Filters
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FilterDropdown;
