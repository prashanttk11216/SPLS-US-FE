import React, { FC } from "react";
import "./Table.scss";
import EllipsisVertical from "../../../assets/icons/ellipsisVertical.svg";

interface Column {
  key: string;
  label: string;
  width?: string;
  isAction?: boolean;
}

interface TableProps {
  columns: Column[]; // List of column definitions
  rows: Record<string, any>[]; // List of row data
  data: Record<string, any>[]; // List of data
  onActionClick?: (action: string, row: Record<string, any>) => void; // Callback for action clicks
  actions?: string[]; // Action names for the dropdown menu
}

const Table: FC<TableProps> = ({ columns, rows, data , onActionClick }) => {
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
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>
                  {column.isAction && row.actions ? (
                    <div className="dropdown text-center">
                      <a
                        role="button"
                        id={`dropdown-${rowIndex}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <img src={EllipsisVertical} height={20} width={20} />
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby={`dropdown-${rowIndex}`}
                      >
                        {row.actions.map((action: string, index: number) => (
                          <li key={index}>
                            <button
                              className="dropdown-item"
                              onClick={() => onActionClick && onActionClick(action, data[rowIndex])}
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
