import React, { FC, useState } from "react";
import "./Table.scss";
import EllipsisVertical from "../../../assets/icons/ellipsisVertical.svg";
import SortIcon from "../../../assets/icons/sort.svg";
import ArrowDownShortWideIcon from "../../../assets/icons/arrowDownShortWide.svg";
import ArrowDownWideShortIcon from "../../../assets/icons/arrowDownWideShort.svg";
import { truncateText } from "../../../utils/globalHelper";

interface Column {
  key: string;
  label: string;
  width?: string;
  isAction?: boolean;
  truncateLength?: number; // Maximum length for truncation
  sortable?: boolean;
  render?: (row: Record<string, any>) => React.ReactNode; // Custom render function for this column
}

interface TableProps {
  columns: Column[]; // List of column definitions
  rows: Record<string, any>[]; // List of row data
  data: Record<string, any>[]; // List of data
  onActionClick?: (action: string, row: Record<string, any>) => void; // Callback for action clicks
  onRowClick?: (row: Record<string, any>) => void; // Callback for row clicks
  actions?: string[]; // Action names for the dropdown menu
  onSort?: (
    sortString: { key: string; direction: "asc" | "desc" } | null
  ) => void; // Callback to trigger API for sorting
  sortConfig?: { key: string; direction: string } | null;
  rowClickable?: boolean;
  showCheckbox?: boolean; // Flag to show checkboxes
  tableActions?: string[]; // General actions like delete
  onTableAction?: (action: string, selectedRows: Record<string, any>[]) => void; // Callback for table actions
}

const Table: FC<TableProps> = ({
  columns,
  rows,
  data,
  onActionClick,
  onRowClick,
  onSort,
  sortConfig, // Pass sortConfig as a prop
  rowClickable = false,
  showCheckbox = false,
  tableActions = [],
  onTableAction,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleSort = (key: string) => {
    const newSortConfig: { key: string; direction: "asc" | "desc" } =
      sortConfig?.key === key
        ? { key, direction: sortConfig.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" };

    // Build sort string for API
    if (onSort) {
      onSort(newSortConfig); // Trigger the callback to update parent state
    }
  };

  const handleRowClick = (row: Record<string, any>) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleActionClick = (
    event: React.MouseEvent,
    _dropdownId: string,
    action: string,
    row: Record<string, any>
  ) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the row click
    if (onActionClick) {
      onActionClick(action, row);
    }
    // Close the dropdown after an action click
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown((prev) => (prev === dropdownId ? null : dropdownId));
  };

  const handleCheckboxChange = (rowIndex: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((index) => index !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(rows.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  const handleTableAction = (action: string) => {
    if (onTableAction) {
      const selectedData = selectedRows.map((index) => data[index]);
      onTableAction(action, selectedData);
    }
  };

  return (
    <div className="table-wrapper">
      {selectedRows.length > 0 && (
        <div className="table-actions my-2 d-flex align-items-center justify-content-between">
          <div>
            <b>({selectedRows.length})</b> selected on this page
          </div>
          <div className="ms-auto">
            {tableActions.map((action) => (
              <button
                key={action}
                className="btn btn-outline-primary btn-sm ms-2"
                onClick={() => handleTableAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
      <table className="common-table">
        <thead>
          <tr>
            {showCheckbox && (
              <th style={{ width: "50px" }}>
                <input
                  type="checkbox"
                  className="form-check-input me-0 mt-0"
                  onChange={handleSelectAll}
                  checked={
                    selectedRows.length > 0 &&
                    selectedRows.length === rows.length
                  }
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width || "auto" }}
                className={`${column.isAction ? "text-center" : ""} ${
                  column.sortable ? "sortable" : ""
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="column-header d-inline-flex align-items-center">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <img
                      src={
                        sortConfig?.key === column.key
                          ? sortConfig.direction === "asc"
                            ? ArrowDownShortWideIcon
                            : ArrowDownWideShortIcon
                          : SortIcon
                      }
                      alt="Sort Icon"
                      className="sort-icon"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="table-row"
              onClick={() => rowClickable && handleRowClick(data[rowIndex])}
            >
              {showCheckbox && (
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input mt-0 me-0"
                    checked={selectedRows.includes(rowIndex)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleCheckboxChange(rowIndex)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>
                  {column.render ? (
                    column.render(row)
                  ) : column.isAction && row.actions ? (
                    <div
                      className="dropdown text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(`dropdown-${rowIndex}`);
                      }}
                    >
                      <a
                        role="button"
                        id={`dropdown-${rowIndex}`}
                        data-bs-toggle="dropdown"
                        aria-expanded={openDropdown === `dropdown-${rowIndex}`}
                      >
                        <img
                          src={EllipsisVertical}
                          height={20}
                          width={20}
                          alt="Actions"
                        />
                      </a>
                      <ul
                        className={`dropdown-menu ${
                          openDropdown === `dropdown-${rowIndex}` ? "show" : ""
                        }`}
                        aria-labelledby={`dropdown-${rowIndex}`}
                      >
                        {row.actions.map((action: string, index: number) => (
                          <li key={index}>
                            <button
                              className="dropdown-item"
                              onClick={(e) => {
                                handleActionClick(
                                  e,
                                  `dropdown-${rowIndex}`,
                                  action,
                                  data[rowIndex]
                                );
                              }}
                            >
                              {action}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div
                      title={
                        typeof row[column.key] === "string" &&
                        column.truncateLength &&
                        row[column.key].length > column.truncateLength
                          ? row[column.key]
                          : ""
                      }
                    >
                      {column.truncateLength &&
                      typeof row[column.key] === "string"
                        ? truncateText(row[column.key], column.truncateLength)
                        : row[column.key]}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="no-record-found">
              <td
                colSpan={columns.length + (showCheckbox ? 1 : 0)}
                className="text-center"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
