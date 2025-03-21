import { useState } from "react";
import SummaryForm from "./SummaryForm";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { exportAccountSummary } from "../../../../../services/dispatch/dispatchServices";
import { toast } from "react-toastify";
import { printContent } from "../../../../../utils/globalHelper";

type FormType = {
  fromDate: string;
  toDate: string;
};

const AccountingSummary: React.FC = () => {
  const [formData, setFormData] = useState<FormType>({
    fromDate: "",
    toDate: "",
  });
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const handleData = (data: FormType) => {
    setFormData(data);
    if (data?.fromDate) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  const { createData } = useFetchData<any>({
    create: {
      summary: exportAccountSummary,
    },
  });

  const downloadSummary = async () => {
    try {
      const result = await createData("summary", formData);
      if (result.success) {
        // const blob = new Blob([result], { type: "application/pdf" });
        // downloadFile(blob, "Account_Summary.pdf");

        printContent(result.data.file);

        toast.success("Downloaded Successfully.");
      } else {
        toast.error("No matching loads found.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error downloading pdf.");
    }
  };

  return (
    <div>
      <h2 className="fw-bolder">Accounting Summary</h2>
      <div className="d-flex align-items-end">
        <SummaryForm handleData={handleData} />
        <div>
          <button
            onClick={downloadSummary}
            disabled={isDisabled}
            className="btn btn-accent btn-md ms-2"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountingSummary;
