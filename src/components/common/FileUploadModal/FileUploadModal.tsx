import React from "react";
import Modal from "../Modal/Modal";
import FileUploader from "../FileUploader/FileUploader";
// import Input from "../Input/Input";
import { useForm } from "react-hook-form";

export type FormProps = {
  fileName: string;
  file: []
}

interface UploadModalProps {
  isOpen: boolean;
  multiple: boolean;
  onClose: () => void;
}

interface UploadedFile {
  filename: string;
  path: string;
}

const FileUploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  multiple,
  onClose,
}) => {
  const {
    handleSubmit,
    formState: { isValid }
  } = useForm<FormProps>({ mode: "onBlur" });

  const submitForm = (data: FormProps) => { 
  }

  const getFiles = (files: UploadedFile[]) => {
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Documents" size="lg">
      {/* <form onSubmit={handleSubmit(submitForm)}>
        <Input
          label="File Name"
          type="text"
          id="fileName"
          name="fileName"
          placeholder="Enter File Name"
          control={control}
        />
      </form> */}
      <FileUploader multiple={multiple} handleSelectedFiles={getFiles} />
      <div className="col-12 text-center d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline btn-lg"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-accent btn-lg ms-2"
          type="submit"
          disabled={!isValid}
          onClick={handleSubmit(submitForm)}
        >
          Submit
        </button>
      </div>
    </Modal>
  );
};

export default FileUploadModal;
