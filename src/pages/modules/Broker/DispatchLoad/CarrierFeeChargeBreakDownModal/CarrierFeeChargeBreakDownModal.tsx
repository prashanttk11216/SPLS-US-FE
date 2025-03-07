import { useForm, useFieldArray } from "react-hook-form";
import Modal from "../../../../../components/common/Modal/Modal";
import {
  CarrierFeeBreakdownForm,
  CarrierFeeForm,
} from "../CreateOrEditDispatchLoad/CreateOrEditDispatchLoad";
import Input from "../../../../../components/common/Input/Input";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import { DispatchLoadTypeOptions } from "../../../../../utils/dropdownOptions";
import { WithoutUnit } from "../../../../../enums/DispatchLoadType";
import {
  calculatePercentage,
  calculatePercentageByUnit,
} from "../../../../../utils/globalHelper";
import { useEffect, useMemo, useState } from "react";
import CurrencyNumberInput from "../../../../../components/common/CurrencyNumberInput/CurrencyNumberInput";

const CarrierFeeChargeBreakDownModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data?: CarrierFeeBreakdownForm;
  calculateCarrierFeeBreakDownCharge: (data: CarrierFeeBreakdownForm) => void;
}> = ({ isOpen, onClose, title, data, calculateCarrierFeeBreakDownCharge }) => {
    const [finalAllInRate, setFinalAllInRate] = useState(0);

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
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
    reset({...values, breakdown: {
      ...values.breakdown,
      OtherChargeSchema: updatedBreakdown,
    }}); // Reset the form with updated values
  };

  const DispatchLoadTypeValue = watch("breakdown.type");
  const carrierRateValue = watch("breakdown.rate");
  const unitsValue = watch("breakdown.units");
  const PDs = watch("breakdown.PDs");
  const fuelServiceCharge = watch("breakdown.fuelServiceCharge")!;
  const OtherChargeSchema = watch("breakdown.OtherChargeSchema");

  const calculateFuelServiceCharge = useMemo(() => {
      if (carrierRateValue) {
        if (unitsValue) {
          return calculatePercentageByUnit(carrierRateValue, fuelServiceCharge?.value!, unitsValue) || 0;
        }
        return calculatePercentage(carrierRateValue, fuelServiceCharge?.value!) || 0;
      }
      return 0;
    }, [carrierRateValue, fuelServiceCharge?.value, unitsValue]);

  const otherChargeAmounts = OtherChargeSchema?.map((charge) => ({
    amount: charge.amount || 0,
    isAdvance: charge.isAdvance,
  })) || [];
  

  // useEffect for all-in rate calculation
  useEffect(() => {
    let calculatedRate = 0;

    if (carrierRateValue) {
      calculatedRate +=
        unitsValue && !isNaN(unitsValue)
          ? carrierRateValue * unitsValue
          : carrierRateValue;
    }

    if (PDs) {
      calculatedRate += PDs;
    }

    if (fuelServiceCharge?.value) {
      if (fuelServiceCharge.isPercentage && carrierRateValue) {
        calculatedRate += unitsValue
          ? calculatePercentageByUnit(
              carrierRateValue,
              fuelServiceCharge.value,
              unitsValue
            )
          : calculatePercentage(carrierRateValue, fuelServiceCharge.value);
      } else {
        calculatedRate += fuelServiceCharge.value;
      }
    }

    if (OtherChargeSchema?.length) {
      const totalOtherCharges = OtherChargeSchema.filter((charge) => !charge.isAdvance).reduce((sum, charge) => sum + (charge.amount || 0), 0) || 0;
      const totalAdvance = OtherChargeSchema?.filter((charge) => charge.isAdvance).reduce((sum, charge) => sum + (charge.amount || 0), 0) || 0;
      calculatedRate = (calculatedRate + totalOtherCharges) - totalAdvance;
    }

    // Update the final all-in rate if it changes
    if (calculatedRate !== finalAllInRate) {
      setFinalAllInRate(calculatedRate);
      setValue("breakdown.totalRate", calculatedRate);
    }
  }, [
    carrierRateValue,
    unitsValue,
    PDs,
    fuelServiceCharge?.value,
    otherChargeAmounts,
    finalAllInRate, // Prevent redundant updates
    setValue
  ]);

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
            <CurrencyNumberInput
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
          {!WithoutUnit.includes(DispatchLoadTypeValue!) && (
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
          {fuelServiceCharge?.isPercentage && (
            <div className="col-2">
              <div>Amount</div>
              <div className="fw-bold">{calculateFuelServiceCharge} $</div>
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
              <CurrencyNumberInput
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
                onChange={() => resetDate(index)}
              />
            </div>
            {watch(`breakdown.OtherChargeSchema.${index}.isAdvance`) && (
              <div className="col-3">
                <DateInput
                  name={`breakdown.OtherChargeSchema.${index}.date`}
                  control={control}
                  label="Date"
                  placeholder="date"
                  datePickerProps={{
                    dateFormat: "yyyy/MM/dd",
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
            <CurrencyNumberInput
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
