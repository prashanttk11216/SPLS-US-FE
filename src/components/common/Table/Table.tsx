import React, { FC } from "react";
import "./Table.scss";
import EllipsisVertical from "../../../assets/icons/ellipsisVertical.svg"

interface Column {
  key: string; // Unique identifier for the column
  label: string; // Display label for the column
  width?: string; // Optional width for the column
  isAction?: boolean; // Flag for action columns
}

interface TableProps {
  columns: Column[]; // List of column definitions
  data: Record<string, any>[]; // List of row data
  onActionClick?: (action: string, row: Record<string, any>) => void; // Callback for action clicks
  actions?: string[]; // Action names for the dropdown menu
}

const Table: FC<TableProps> = ({ columns, data, onActionClick, actions }) => {
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
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>
                  {column.isAction && actions ? (
                    // Bootstrap dropdown for actions
                    <div className="dropdown text-center">
                      <a
                        role="button"
                        id={`dropdown-${rowIndex}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <img src={EllipsisVertical}  height={20} width={20}/>
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby={`dropdown-${rowIndex}`}
                      >
                        {actions.map((action, index) => (
                          <li key={index}>
                            <button
                              className="dropdown-item"
                              onClick={() => onActionClick && onActionClick(action, row)}
                            >
                              {action}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr className="no-record-found">
              <td colSpan={columns.length} className="text-center">
                No Records Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
