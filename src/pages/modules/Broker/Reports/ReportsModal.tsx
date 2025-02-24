import React, { useState } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import ReportForm from "./ReportForm";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { downloadReport } from "../../../../services/dispatch/dispatchServices";
import { downloadExcelFile } from "../../../../utils/excelUtils";
import { toast } from "react-toastify";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<any>({});

  const handleData = (data: any) => {
    setFormData(data);
  };

  const { createData } = useFetchData<any>({
    create: {
      report: downloadReport,
    },
  });

  const handleSubmit = async () => {
    const response = await createData("report", formData);
    if (response.success) {
      toast.success(response.message);
      downloadExcelFile(response.data.data, `report.xlsx`);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download Report"
      size="lg"
    ></Modal>
  );
};

export default ReportsModal;
