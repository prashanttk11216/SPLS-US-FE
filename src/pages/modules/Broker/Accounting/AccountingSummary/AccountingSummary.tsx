import { useState } from "react";
import SummaryForm, { SummaryFormTypes } from "./SummaryForm";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { exportAccountSummary } from "../../../../../services/dispatch/dispatchServices";
import { toast } from "react-toastify";
import { downloadFile } from "../../../../../utils/globalHelper";

const AccountingSummary: React.FC = () => {
  const [formData, setFormData] = useState<SummaryFormTypes>();

  const handleData = (data: any) => {
    setFormData(data);
  };

  const { createData } = useFetchData<any>({
    create: {
      summary: exportAccountSummary,
    },
  });

  const downloadSummary = async () => {
    try {
      let result: any = await createData("summary", formData);
      if (result) {
        toast.success(result.message);
        const blob = new Blob([result], { type: "application/pdf" });
        downloadFile(blob, "account_summary.pdf");
      }
    } catch (err) {
      toast.error("Error downloading pdf.");
    }
  };

  return (
    <div>
      <h2 className="fw-bolder">Accounting Summary</h2>
      <div className="d-flex">
        <SummaryForm handleData={handleData} />
        <button
          onClick={downloadSummary}
          className="btn btn-accent btn-md ms-2"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default AccountingSummary;
