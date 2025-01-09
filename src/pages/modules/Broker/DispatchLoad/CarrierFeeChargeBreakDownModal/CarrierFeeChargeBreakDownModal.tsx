import { useForm, useFieldArray } from "react-hook-form";
import Modal from "../../../../../components/common/Modal/Modal";
import {
  CarrierFeeBreakdownForm,
  CarrierFeeForm,
  OtherChargeForm,
} from "../CreateOrEditDispatchLoad/CreateOrEditDispatchLoad";
import Input from "../../../../../components/common/Input/Input";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import { DispatchLoadTypeOptions } from "../../../../../utils/dropdownOptions";
import { DispatchLoadType } from "../../../../../enums/DispatchLoadType";
import {
  calculatePercentage,
  calculatePercentageByUnit,
} from "../../../../../utils/globalHelper";

const CarrierFeeChargeBreakDownModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data?: CarrierFeeBreakdownForm;
  calculateCarrierFeeBreakDownCharge: (data: CarrierFeeBreakdownForm) => void;
}> = ({ isOpen, onClose, title, data, calculateCarrierFeeBreakDownCharge }) => {
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { isValid },
  } = useForm<Partial<CarrierFeeForm>>({
    mode: "onBlur",
    defaultValues: {
      breakdown: data
        ? data
        : {
            rate: undefined,
            fuelServiceCharge: undefined,
            PDs: undefined,
            units: undefined,
            totalRate: undefined,

            OtherChargeSchema: [
              {
                description: undefined,
                amount: undefined,
                isAdvance: false,
                date: undefined,
              },
            ],
          },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "breakdown.OtherChargeSchema",
  });

  const addCharge = () => {
    append({
      description: undefined,
      amount: undefined,
      isAdvance: false,
      date: undefined,
    });
  };

  const onSubmit = (data: Partial<CarrierFeeForm>) => {
    const breakdown ={
        ...data.breakdown!,
        OtherChargeSchema: data.breakdown?.OtherChargeSchema?.filter((item) => item?.amount !== undefined)
      };
    if (breakdown) {
      calculateCarrierFeeBreakDownCharge(breakdown);
    } else {
      onClose();
    }
  };

  const resetDate = (index: number) => {
    const values = getValues(); // Get current values
    const updatedBreakdown = [...values.breakdown?.OtherChargeSchema!]; // Clone the array
    updatedBreakdown[index].date = undefined; // Reset the specific field
    reset({
      breakdown: {
        OtherChargeSchema: updatedBreakdown,
      },
    }); // Reset the form with updated values
  };

  const DispatchLoadTypeValue = watch("breakdown.type");
  const carrierRateValue = watch("breakdown.rate");
  const unitsValue = watch("breakdown.units");
  const PDs = watch("breakdown.PDs");
  const fuelServiceCharge = watch("breakdown.fuelServiceCharge")!;
  const OtherChargeSchema = watch("breakdown.OtherChargeSchema");

  const calculateFuelServiceCharge = () => {
    if (carrierRateValue) {
      if (unitsValue) {
        return calculatePercentageByUnit(
          carrierRateValue,
          fuelServiceCharge.value,
          unitsValue
        );
      }
      return calculatePercentage(carrierRateValue, fuelServiceCharge.value);
    }
    return false;
  };

  let finalAllInRate = 0;

  if (carrierRateValue) {
    if (unitsValue) {
      finalAllInRate += carrierRateValue * unitsValue;
    } else {
      finalAllInRate += carrierRateValue;
    }
  }
  if (PDs) {
    finalAllInRate += PDs;
  }
  if (fuelServiceCharge?.value) {
    if (fuelServiceCharge.isPercentage && carrierRateValue) {
      if (unitsValue) {
        finalAllInRate += calculatePercentageByUnit(
          carrierRateValue,
          fuelServiceCharge.value,
          unitsValue
        );
      } else {
        finalAllInRate += calculatePercentage(
          carrierRateValue,
          fuelServiceCharge.value
        );
      }
    } else {
      finalAllInRate += fuelServiceCharge.value;
    }
  }
  if (OtherChargeSchema?.length) {
    let totalOtherCharges = OtherChargeSchema.filter(
      (charge) => !charge.isAdvance
    ) // Exclude advance charges
      .reduce((sum, charge) => sum + charge.amount!, 0);
    let totalAdvance =
      OtherChargeSchema?.filter((charge) => charge.isAdvance) // Include only advance charges
        .reduce((sum, charge) => sum + charge.amount!, 0) || 0;

    finalAllInRate = finalAllInRate + totalOtherCharges - totalAdvance;
  }

  if (finalAllInRate) setValue("breakdown.totalRate", finalAllInRate);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          {/* Type */}
          <div className="col-3">
            <SelectField
              label="Type"
              name="breakdown.type"
              placeholder="Select Type"
              control={control}
              options={DispatchLoadTypeOptions}
            />
          </div>
          {/* Carrier All-in Rate*/}
          <div className="col-3">
            <NumberInput
              label="Rate"
              id="breakdown.rate"
              name="breakdown.rate"
              placeholder="Enter Rate"
              control={control}
              currency
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>
          {/* Conditionally show Unit Number if 'Pallets' is selected */}
          {DispatchLoadTypeValue === DispatchLoadType.PALLETS && (
            <div className="col-3">
              <NumberInput
                label="Units"
                id="breakdown.units"
                name="breakdown.units"
                placeholder="Enter units"
                control={control}
                rules={{
                  min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                }}
              />
            </div>
          )}
          {/* Picks/Drops */}
          <div className="col-3">
            <NumberInput
              label="P/Ds"
              id="breakdown.PDs"
              name="breakdown.PDs"
              placeholder="Enter Picks/Drops"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>
          {/* F.S.C */}
          <div className="col-3 position-relative">
            <NumberInput
              label="F.S.C"
              id="breakdown.fuelServiceCharge.value"
              name="breakdown.fuelServiceCharge.value"
              placeholder={
                watch("breakdown.fuelServiceCharge.isPercentage")
                  ? "Enter Percentage"
                  : "Enter F.S.C"
              }
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                max: {
                  value: watch("breakdown.fuelServiceCharge.isPercentage")
                    ? 100
                    : Infinity,
                  message: VALIDATION_MESSAGES.percentageRange,
                },
              }}
            />

            <div className="position-absolute top-0 end-0">
              <CheckboxField
                label="Rate %"
                id="breakdown.fuelServiceCharge.isPercentage"
                name="breakdown.fuelServiceCharge.isPercentage"
                control={control}
                onChange={() =>
                  setValue("breakdown.fuelServiceCharge.value", 0)
                }
              />
            </div>
          </div>
          {watch("breakdown.fuelServiceCharge.isPercentage") &&
            calculateFuelServiceCharge() && (
              <div className="col-2 d-flex align-items-center">
                = {calculateFuelServiceCharge()}
              </div>
            )}
        </div>

        <hr />
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
                watch(`breakdown.OtherChargeSchema.${index}.isAdvance`)
                  ? "col-4"
                  : "col-7"
              }
            >
              <Input
                label="Description"
                type="text"
                id={`breakdown.OtherChargeSchema.${index}.description`}
                name={`breakdown.OtherChargeSchema.${index}.description`}
                placeholder="Enter Charge Description"
                control={control}
              />
            </div>
            <div className="col-3">
              <NumberInput
                label="Amount"
                id={`breakdown.OtherChargeSchema.${index}.amount`}
                name={`breakdown.OtherChargeSchema.${index}.amount`}
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
                id={`breakdown.OtherChargeSchema.${index}.isAdvance`}
                name={`breakdown.OtherChargeSchema.${index}.isAdvance`}
                control={control}
                onChange={(event) => resetDate(index)}
              />
            </div>
            {watch(`breakdown.OtherChargeSchema.${index}.isAdvance`) && (
              <div className="col-3">
                <DateInput
                  name={`breakdown.OtherChargeSchema.${index}.date`}
                  control={control}
                  label="Date"
                  required={true}
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
        <hr />
        <div className="row">
          <div className="col-3">
            <NumberInput
              label="Total Rate"
              id="breakdown.totalRate"
              name="breakdown.totalRate"
              placeholder="Enter Total Rate"
              control={control}
              currency
            />
          </div>
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

export default CarrierFeeChargeBreakDownModal;
