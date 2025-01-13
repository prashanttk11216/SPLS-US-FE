import { useForm, useFieldArray } from "react-hook-form";
import Modal from "../../../../../components/common/Modal/Modal";
import {
  OtherChargeBreakdownForm,
  OtherChargeForm,
} from "../CreateOrEditDispatchLoad/CreateOrEditDispatchLoad";
import Input from "../../../../../components/common/Input/Input";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import DateInput from "../../../../../components/common/DateInput/DateInput";

const OtherChargesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data?: OtherChargeBreakdownForm[];
  calculateOtherBreakDownCharge: (data: OtherChargeBreakdownForm[]) => void;
}> = ({ isOpen, onClose, title, data, calculateOtherBreakDownCharge }) => {
  const {
    handleSubmit,
    control,
    getValues,
    watch,
    reset,
    formState: { isValid },
  } = useForm<Partial<OtherChargeForm>>({
    mode: "onBlur",
    defaultValues: {
      breakdown: data?.length
        ? data
        : [
            {
              description: undefined,
              amount: undefined,
              isAdvance: false,
              date: undefined,
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "breakdown",
  });

  const addCharge = () => {
    append({
      description: undefined,
      amount: undefined,
      isAdvance: false,
      date: undefined,
    });
  };

  const onSubmit = (data: Partial<OtherChargeForm>) => {
    // Filter entries that have a defined `amount` field
    const filteredData = {
      ...data,
      breakdown: data.breakdown?.filter((item) => item?.amount !== undefined),
    };

    if (filteredData.breakdown?.length) {
      calculateOtherBreakDownCharge(filteredData.breakdown);
    } else {
      onClose();
    }
  };

  const resetDate = (index: number) => {
    const values = getValues(); // Get current values
    const updatedBreakdown = [...values.breakdown!]; // Clone the array
    updatedBreakdown[index].date = undefined; // Reset the specific field
    reset({ breakdown: updatedBreakdown }); // Reset the form with updated values
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="row mb-3">
            <div className="col-12 text-end">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
            <div
              className={
                watch(`breakdown.${index}.isAdvance`) ? "col-4" : "col-7"
              }
            >
              <Input
                label="Description"
                type="text"
                id={`breakdown.${index}.description`}
                name={`breakdown.${index}.description`}
                placeholder="Enter Charge Description"
                control={control}
              />
            </div>
            <div className="col-3">
              <NumberInput
                label="Amount"
                id={`breakdown.${index}.amount`}
                name={`breakdown.${index}.amount`}
                placeholder="Amount"
                control={control}
                currency
                rules={{
                  min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                }}
              />
            </div>
            <div className="col-2 d-flex align-items-center">
              <CheckboxField
                label="Advance"
                id={`breakdown.${index}.isAdvance`}
                name={`breakdown.${index}.isAdvance`}
                control={control}
                onChange={(event) => resetDate(index)}
              />
            </div>
            {watch(`breakdown.${index}.isAdvance`) && (
              <div className="col-3">
                <DateInput
                  name={`breakdown.${index}.date`}
                  control={control}
                  label="Date"
                  placeholder="date"
                  datePickerProps={{
                    dateFormat: "MM/dd/yyyy",
                  }}
                />
              </div>
            )}
          </div>
        ))}
        <div className="d-flex justify-content-center mt-3">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={addCharge}
          >
            Add Charge
          </button>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-success">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OtherChargesModal;
