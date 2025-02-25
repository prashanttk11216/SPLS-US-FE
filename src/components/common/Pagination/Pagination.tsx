import React, { useEffect, useState, useRef } from "react";
import "./Pagination.scss";

export type PaginationState = {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};

interface PaginationProps {
  meta: PaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { page, limit, totalPages } = meta;
  const [inputPage, setInputPage] = useState(page); // Local state for the input field
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // Timer for debouncing

  useEffect(() => {
    setInputPage(page); // Sync input with current page
  }, [page]);

  const handlePageInput = (value: number) => {
    setInputPage(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      if (value >= 1 && value <= totalPages) {
        onPageChange(value);
      } else {
        setInputPage(page); // Reset input if invalid
      }
    }, 500); // Reduced debounce time for faster UX
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => Number(event.target.value) !== limit && onItemsPerPageChange(Number(event.target.value));

  const getPageNumbers = () => {
    const maxButtons = 5;
    if (totalPages <= 0) return [];

    const pages: (number | string)[] = [];
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...");
      } else if (page >= totalPages - 2) {
        pages.push("...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push("...", page - 1, page, page + 1, "...");
      }
    }
    return pages;
  };

  const handleEllipsisClick = (direction: "left" | "right") => {
    const jumpPages = 3;
    if (direction === "left") {
      const newPage = Math.max(page - jumpPages, 1);
      onPageChange(newPage);
    } else {
      const newPage = Math.min(page + jumpPages, totalPages);
      onPageChange(newPage);
    }
  };

  return (
    <div className="custom-pagination-wrapper">
      {/* Left: Items per page selector */}
      <div className="items-per-page">
        <select
          className="form-select form-select-lg"
          value={limit}
          onChange={handleItemsPerPageChange}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>

      {/* Center: Pagination buttons */}
      <div className="pagination">
        {/* Previous page */}
        <button
          className="btn btn-white btn-lg btn-custom-pagination"
          disabled={page === 1}
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
        >
          &#60;
        </button>
        {getPageNumbers().map((pageNumber, index) =>
          pageNumber === "..." ? (
            <button
              key={index}
              className="btn btn-white btn-lg ellipsis btn-custom-pagination"
              aria-label={`Jump ${index === 0 ? "backward" : "forward"}`}
              onClick={() =>
                handleEllipsisClick(index === 0 ? "left" : "right")
              }
            >
              ...
            </button>
          ) : (
            <button
              key={pageNumber}
              className={`btn btn-white btn-lg btn-custom-pagination ${
                page === pageNumber ? "active" : ""
              }`}
              aria-current={page === pageNumber ? "page" : undefined}
              onClick={() => onPageChange(Number(pageNumber))}
            >
              {pageNumber}
            </button>
          )
        )}

        {/* Next page */}
        <button
          className="btn btn-white btn-lg btn-custom-pagination"
          disabled={page === totalPages}
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
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
            disabled={inputPage == totalPages}
            value={inputPage}
            aria-label="Go to page"
            onChange={(e) => handlePageInput(Number(e.target.value))}
          />
        </div>

        <div>of {totalPages}</div>
      </div>
    </div>
  );
};

export default Pagination;
