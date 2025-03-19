import { useEffect, useState } from "react";
import ReportForm, { ReportFormProps } from "./ReportForm";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { downloadReport } from "../../../../services/dispatch/dispatchServices";
import { downloadExcelFile } from "../../../../utils/excelUtils";
import { toast } from "react-toastify";

const Reports: React.FC = () => {
  const [formData, setFormData] = useState<ReportFormProps>();
  const [isFormEmpty, setIsFormEmpty] = useState<boolean>(true);

  const handleData = (data: any) => {
    setFormData(data);
  };

  useEffect(() => {
    if (formData) {
      const { category, categoryValue, filterBy, dateRange } = formData;
      setIsFormEmpty(
        !category &&
          !categoryValue &&
          !filterBy &&
          (!dateRange || dateRange.length === 0)
      );
    }
  }, [formData]);

  const { createData } = useFetchData<any>({
    create: {
      report: downloadReport,
    },
  });

  const handleSubmit = async () => {
    const result: any = await createData("report", formData);
    if(result.size != 0){
      downloadExcelFile(result, `Report.xlsx`);
    }else{
      toast.error("No matching loads found for the given filters.")
    }
  };

  return (
    <div>
      <h2 className="fw-bolder">Reports</h2>
      <ReportForm handleData={handleData} />
      <div className="col-12 text-center d-flex justify-content-end mt-4">
        <button
          onClick={handleSubmit}
          className="btn btn-accent btn-lg ms-2"
          disabled={isFormEmpty}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default Reports;
