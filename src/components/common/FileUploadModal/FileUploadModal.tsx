import React from "react";
import Modal from "../Modal/Modal";
import FileUploader from "../FileUploader/FileUploader";
import { toast } from "react-toastify";
import useFetchData from "../../../hooks/useFetchData/useFetchData";
import { editLoad } from "../../../services/dispatch/dispatchServices";

interface UploadModalProps {
  isOpen: boolean;
  multiple: boolean;
  dispatchDetails: any;
  onClose: () => void;
}

interface UploadedFile {
  filename: string;
  path: string;
}

const FileUploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  multiple,
  dispatchDetails,
  onClose,
}) => {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  const { updateData } = useFetchData<any>({
    update: {
      updateDocument: editLoad,
    },
  });

  const submitForm = async () => {
    if (files.length) {
      let payload = files;
      if(dispatchDetails?.documents?.length > 0){
        payload = [...dispatchDetails.documents, ...files];
      }
      const result = await updateData("updateDocument", dispatchDetails._id as string, {
        documents: payload,
      });
      if (result.success) {
        toast.success(result.message || "Files uploaded successfully");
        onClose();
      } else {
        toast.error(result.message || "Failed to upload files");
      }
    }
  };

  const getFiles = (files: UploadedFile[]) => {
    setFiles(files);
  };

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
          disabled={files.length === 0}
          onClick={submitForm}
        >
          Submit
        </button>
      </div>
    </Modal>
  );
};

export default FileUploadModal;
