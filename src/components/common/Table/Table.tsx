import React, { FC, useState } from "react";
import "./Table.scss";
import EllipsisVertical from "../../../assets/icons/ellipsisVertical.svg";
import { truncateText } from "../../../utils/globalHelper";

interface Column {
  key: string;
  label: string;
  width?: string;
  isAction?: boolean;
  truncateLength?: number; // Maximum length for truncation
}

interface TableProps {
  columns: Column[]; // List of column definitions
  rows: Record<string, any>[]; // List of row data
  data: Record<string, any>[]; // List of data
  onActionClick?: (action: string, row: Record<string, any>) => void; // Callback for action clicks
  onRowClick?: (row: Record<string, any>) => void; // Callback for row clicks
  actions?: string[]; // Action names for the dropdown menu
  rowClickable?: boolean;
}

const Table: FC<TableProps> = ({ columns, rows, data, onActionClick, rowClickable =  false }) => {
  // State to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleRowClick = (row: Record<string, any>) => {
    if (onActionClick) {
      onActionClick("View Details", row);
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

  return (
    <div className="table-wrapper">
      <table className="common-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width || "auto" }}
                className={column.isAction ? "text-center" : ""}
              >
                {column.label}
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
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>
                  {column.isAction && row.actions ? (
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
                        <img src={EllipsisVertical} height={20} width={20} />
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
                                handleActionClick(e, `dropdown-${rowIndex}`, action, data[rowIndex]);
                              }}
                            >
                              {action}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div title={typeof row[column.key] === "string" && column.truncateLength && row[column.key].length > column.truncateLength ? row[column.key] : ""}>
                          {
                            column.truncateLength && typeof row[column.key] === "string"
                            ? truncateText(row[column.key], column.truncateLength)
                            : row[column.key]
                          }
                    </div>
                    
                  )}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="no-record-found">
              <td colSpan={columns.length} className="text-center">
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
