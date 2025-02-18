import React, { useState, DragEvent } from "react";
import useFetchData from "../../../hooks/useFetchData/useFetchData";
import {
  uploadMultipleDocument,
  uploadSingleDocument,
} from "../../../services/upload/uploadServices";
import { toast } from "react-toastify";

interface UploadedFile {
  filename: string;
  path: string;
}

interface FileUploaderProps {
  multiple: boolean;
  handleSelectedFiles: (files: UploadedFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  multiple,
  handleSelectedFiles,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { createData } = useFetchData<any>({
    create: {
      uploadSingle: uploadSingleDocument,
      uploadMultiple: uploadMultipleDocument,
    },
  });

  // Common file handling function for both input and drop events
  const handleFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const fileList = Array.from(selectedFiles);
    try {
      if (!multiple) {
        const formData = new FormData();
        // Only take the first file if not multiple
        setFiles(fileList.slice(0, 1));
        formData.append("file", fileList[0]);
        const result = await createData("uploadSingle", formData);
        if (result.success) {
          handleSelectedFiles([
            {
              filename: result.data.filename,
              path: result.data.path,
            },
          ]);
        } else {
          toast.error(result.message || "Failed to upload file.");
        }
      } else {
        setFiles((prevFiles) => [...prevFiles, ...fileList]);
        const formData = new FormData();
        // Append each file individually to FormData
        fileList.forEach((file) => {
          formData.append("files", file);
        });
        const result = await createData("uploadMultiple", formData);
        if (result.success) {
          const uploadedFiles = fileList.map((file, index) => ({
            filename: result.data[index].filename,
            path: result.data[index].path,
          }));
          handleSelectedFiles(uploadedFiles);
        } else {
          toast.error(result.message || "Failed to upload file.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while uploading files.");
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    await handleFiles(event.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "4px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <input
          type="file"
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
          Drag and drop files here or click to upload
        </label>
      </div>
      <div>
        {files.length > 0 && (
          <ol>
            {files.map((file, index) => (
              <li key={index}>
                {file.name}{" "}
                <button
                  className="btn btn-outline btn-sm text-danger"
                  onClick={() => removeFile(index)}
                >
                  X
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
};

export default FileUploader;
