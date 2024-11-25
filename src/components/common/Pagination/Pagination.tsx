import React, { useEffect, useState, useRef } from "react";
import "./Pagination.scss";
import Select from "../SelectInput/SelectInput";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [inputPage, setInputPage] = useState(currentPage); // Local state for the input field
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // Timer for debouncing

  useEffect(() => {
    setInputPage(currentPage); // Sync input with currentPage whenever it changes
  }, [currentPage]);

  const handlePageInput = (value: number) => {
    setInputPage(value); // Update the input field's state

    // Clear the existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer to delay the navigation
    debounceTimer.current = setTimeout(() => {
      if (value >= 1 && value <= totalPages) {
        onPageChange(value); // Trigger the parent function to change the page
      } else {
        setInputPage(currentPage); // Reset input if invalid
      }
    }, 1000);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = Number(event.target.value);
    onItemsPerPageChange(newItemsPerPage);
    onPageChange(1); // Reset to the first page when items per page changes
  };

  const getPageNumbers = () => {
    const maxButtons = 5;
    if (isNaN(totalPages) || totalPages <= 0) return [];

    const pages: (number | string)[] = [];
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const handleEllipsisClick = (ellipsisPosition: string) => {
    const jumpPages = 3; // Number of pages to jump
    if (ellipsisPosition === "left") {
      const newPage = currentPage - jumpPages > 0 ? currentPage - jumpPages : 1;
      onPageChange(newPage);
    } else if (ellipsisPosition === "right") {
      const newPage =
        currentPage + jumpPages <= totalPages
          ? currentPage + jumpPages
          : totalPages;
      onPageChange(newPage);
    }
  };

  return (
    <div className="pagination-wrapper d-flex align-items-center justify-content-between">
      {/* Left: Page size selector */}
      <div className="d-flex align-items-center">
        <div className="me-2">Page Size:</div>
        <Select
          label=""
          id="pgSize"
          name="pgSize"
          options={[
            { value: 10, label: "10" },
            { value: 25, label: "25" },
            { value: 50, label: "50" },
          ]}
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          showDefaultOption={false}
          required
        />
      </div>

      {/* Center: Pagination buttons */}
      <div className="pagination">
        <button
          className="btn btn-white btn-lg btn-pagination"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &#60;
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            const ellipsisPosition = index === 1 ? "left" : "right";
            return (
              <button
                key={index}
                className="btn btn-white btn-lg ellipsis btn-pagination"
                onClick={() => handleEllipsisClick(ellipsisPosition)}
              >
                ...
              </button>
            );
          }
          return (
            <button
              key={page}
              className={`btn btn-white btn-lg btn-pagination ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => onPageChange(Number(page))}
            >
              {page}
            </button>
          );
        })}

        <button
          className="btn btn-white btn-lg btn-pagination"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &#62;
        </button>
      </div>

      {/* Right: Page status */}
      <div className="d-flex align-items-center gap-2">
        <div>Page:</div>
        <div>
          <input
            type="number"
            className="form-control form-control-lg"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => {
              const page = Number(e.target.value);
              handlePageInput(page);
            }}
            style={{ width: "80px", height: "34px" }}
          />
        </div>
        <div>of {totalPages}</div>
      </div>
    </div>
  );
};

export default Pagination;
