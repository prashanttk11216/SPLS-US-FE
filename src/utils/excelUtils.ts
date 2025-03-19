import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * exportToExcel(exportData, "DispatchData", "Dispatches");
 * Exports given JSON data as an Excel file.
 * @param data - Array of objects to be exported.
 * @param fileName - Name of the Excel file.
 * @param sheetName - Name of the worksheet.
 */
export const exportToExcel = (
  data: unknown[],
  fileName: string = "ExportedData",
  sheetName: string = "Sheet1"
) => {
  if (!data || data.length === 0) {
    console.warn("No data to export!");
    return;
  }

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Convert to binary Excel file and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(dataBlob, `${fileName}.xlsx`);
};


/**
 * Downloads an Excel file from a given buffer.
 * @param {ArrayBuffer} buffer - The Excel file data as an ArrayBuffer.
 * @param {string} filename - The name for the downloaded file.
 */
export const downloadExcelFile = (buffer: Buffer, filename = "export.xlsx") => {
  if (!buffer) {
    console.error("No data provided to download.");
    return;
  }

  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

