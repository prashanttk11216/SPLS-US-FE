import { useState } from "react";
import ReportsModal from "./ReportsModal";

const Reports: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <h1>Reports</h1>
      {!open && (
        <button
          className="btn btn-secondary btn-lg"
          type="button"
          onClick={() => setOpen(true)}
        >
          Download Report
        </button>
      )}
      <ReportsModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Reports;
