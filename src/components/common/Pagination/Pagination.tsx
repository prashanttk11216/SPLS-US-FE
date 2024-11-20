import React from "react";
import "./Pagination.scss";

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
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onItemsPerPageChange(Number(event.target.value));
  };

  const getPageNumbers = () => {
    const maxButtons = 5; // Number of visible buttons before showing "..."
    const pages: (number | string)[] = [];

    if (totalPages <= maxButtons) {
      // Show all pages if total pages <= maxButtons
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Handle pages with "..." for large number of pages
      if (currentPage <= 3) {
        // Show first few pages and "..."
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show "..." and last few pages
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Show "..." on both sides of the current page
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
      handlePageClick(currentPage - jumpPages > 0 ? currentPage - jumpPages : 1);
    } else if (ellipsisPosition === "right") {
      handlePageClick(
        currentPage + jumpPages <= totalPages
          ? currentPage + jumpPages
          : totalPages
      );
    }
  };

  return (
    <div className="pagination-wrapper">
      {/* Left: Page size selector */}
      <div className="page-size-selector">
        <label htmlFor="itemsPerPage" className="me-2">
          Page Size:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          {/* <option value={100}>100</option> */}
        </select>
      </div>

      {/* Center: Pagination buttons */}
      <div className="pagination">
        <button
          className="btn-pagination"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
        >
          &#60;
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            const ellipsisPosition = index === 1 ? "left" : "right"; 
            return (
              <button
                key={index}
                className="btn-pagination ellipsis"
                onClick={() => handleEllipsisClick(ellipsisPosition)}
              >
                ...
              </button>
            );
          }
          return (
            <button
              key={page}
              className={`btn-pagination ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => handlePageClick(Number(page))}
            >
              {page}
            </button>
          );
        })}

        <button
          className="btn-pagination"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
        >
          &#62;
        </button>
      </div>

      {/* Right: Page status */}
      <div className="page-status text-end">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
