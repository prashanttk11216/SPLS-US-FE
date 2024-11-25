import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    setInputPage(currentPage); // Sync input with currentPage whenever it changes
  }, [currentPage]);

  const handlePageInput = (value: number) => {
    setInputPage(value); // Update the input field's state
  };

  const jumpToPage = (value: number) => {
    if (value >= 1 && value <= totalPages) {
      onPageChange(value); // Trigger the parent function to change the page
    } else {
      setInputPage(currentPage); // Reset input if invalid
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(Math.max(totalPages, 1));
    }
  }, [totalItems, itemsPerPage, totalPages, currentPage, onPageChange]);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      console.log(`Changing to page: ${page}`); // Debug log
      onPageChange(page); // Ensure this updates `currentPage` in the parent
    }
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = Number(event.target.value);
    onItemsPerPageChange(newItemsPerPage);
    onPageChange(1); // Reset to the first page when items per page changes
  };

  // const getPageNumbers = () => {
  //   const maxButtons = 5; // Number of visible buttons before showing "..."
  //   const pages: (number | string)[] = [];

  //   if (totalPages <= maxButtons) {
  //     // Show all pages if total pages <= maxButtons
  //     for (let i = 1; i <= totalPages; i++) {
  //       pages.push(i);
  //     }
  //   } else {
  //     // Handle pages with "..." for large number of pages
  //     if (currentPage <= 3) {
  //       // Show first few pages and "..."
  //       pages.push(1, 2, 3, "...", totalPages);
  //     } else if (currentPage >= totalPages - 2) {
  //       // Show "..." and last few pages
  //       pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
  //     } else {
  //       // Show "..." on both sides of the current page
  //       pages.push(
  //         1,
  //         "...",
  //         currentPage - 1,
  //         currentPage,
  //         currentPage + 1,
  //         "...",
  //         totalPages
  //       );
  //     }
  //   }
  //   return pages;
  // };

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
      handlePageClick(
        currentPage - jumpPages > 0 ? currentPage - jumpPages : 1
      );
    } else if (ellipsisPosition === "right") {
      handlePageClick(
        currentPage + jumpPages <= totalPages
          ? currentPage + jumpPages
          : totalPages
      );
    }
  };
  // const handlePageChangeInput = (value: number, jump: boolean = false) => {
  //   if (value < 1 || value > totalPages) return; // Prevent invalid page numbers
  //   if (jump) {
  //     onPageChange(value); // Update to the new page when user presses Enter
  //   }
  // };

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
                className="btn btn-white btn-lg  ellipsis btn-pagination"
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
              onClick={() => handlePageClick(Number(page))}
            >
              {page}
            </button>
          );
        })}

        <button
          className="btn btn-white btn-lg  btn-pagination"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
        >
          &#62;
        </button>
      </div>

      {/* Right: Page status */}

      {/* <div className="page-status text-end">
        Page {currentPage} of {totalPages}
      </div> */}

      <div className="d-flex align-items-center gap-2">
        <div>Page : </div>

        <div>
          <input
            type="number"
            className="form-control form-control-lg"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => handlePageInput(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                jumpToPage(Number(e.currentTarget.value));
              }
            }}
            style={{ width: "60px", height: "34px" }}
          />
        </div>
        <div>of {totalPages}</div>
      </div>
    </div>
  );
};

export default Pagination;
