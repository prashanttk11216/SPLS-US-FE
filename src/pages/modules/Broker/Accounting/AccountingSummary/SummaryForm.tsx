import { useForm, useWatch } from "react-hook-form";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import { useEffect, useRef } from "react";

interface FormProps {
  handleData: (data: any) => void;
}

export type SummaryFormTypes = {
  dateRange: string;
};

const SummaryForm: React.FC<FormProps> = ({handleData}) => {
    const { control, getValues } = useForm<SummaryFormTypes>();
    const previousFormValues = useRef<any>({})
    const dateRangeValues = useWatch({
        control,
      name: ["dateRange"],
    });

    useEffect(() => {
      const dateRange = getValues("dateRange");
      const fromDate = dateRange ? dateRange[0] : null;
        const toDate = dateRange ? dateRange[1] : null;
        const formData = {
          fromDate: fromDate ? new Date(fromDate).toISOString() : null,
          toDate: toDate ? new Date(toDate).toISOString() : null,
        };

        // Only call handleData if formData has changed
        if (
          JSON.stringify(formData) !==
          JSON.stringify(previousFormValues.current)
        ) {
          handleData(formData);
          previousFormValues.current = formData;
        }
      console.log(fromDate, toDate);
    }, [dateRangeValues, getValues, handleData]);
  return (
    <div>
      <DateInput
        label="Date Range"
        placeholder="Select Date Range"
        name="dateRange"
        control={control} // Pass the control object from react-hook-form
        isRange={true}
        required={true}
        datePickerProps={{
          dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
          isClearable: true,
          selectsRange: true,
        }}
      />
    </div>
  );
};

export default SummaryForm