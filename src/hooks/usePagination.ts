import { useState } from "react";
import { PaginationState } from "../components/common/Pagination/Pagination";


const usePagination = (initialPagination: PaginationState = { page: 1, limit: 10, totalPages: 0, totalItems: 0 }) => {
  const [meta, setPagination] = useState<PaginationState>(initialPagination);

  const updatePagination = (newPagination: Partial<PaginationState>) => {
    setPagination((prevPagination) => ({ ...prevPagination, ...newPagination }));
  };

  const resetPagination = () => {
    setPagination(initialPagination);
  };

  return { meta, setPagination, updatePagination, resetPagination };
};

export default usePagination;
