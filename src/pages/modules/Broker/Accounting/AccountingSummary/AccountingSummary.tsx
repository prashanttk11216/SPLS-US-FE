import { useState } from "react";
import SummaryForm from "./SummaryForm";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { exportAccountSummary } from "../../../../../services/dispatch/dispatchServices";
import { toast } from "react-toastify";
import { downloadFile } from "../../../../../utils/globalHelper";

type FormType = {
  fromDate: string;
  toDate: string;
}

const AccountingSummary: React.FC = () => {
  const [formData, setFormData] = useState<FormType>({
    fromDate: "",
    toDate: ""
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
      const result: any = await createData("summary", formData);
      if (result) {
        const blob = new Blob([result], { type: "application/pdf" }); 
        downloadFile(blob, "Account_Summary.pdf");
        toast.success("Downloaded Successfully.");
      }
    } catch (err) {
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
