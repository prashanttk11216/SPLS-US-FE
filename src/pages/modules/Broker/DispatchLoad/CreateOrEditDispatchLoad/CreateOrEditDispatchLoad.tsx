import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { Equipment } from "../../../../../enums/Equipment";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import { UserRole } from "../../../../../enums/UserRole";
import { getUsers } from "../../../../../services/user/userService";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import { DispatchLoadStatus } from "../../../../../enums/DispatchLoadStatus";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import Input from "../../../../../components/common/Input/Input";
import {
  transformedCreateDispatchSchema,
  updateDispatchSchema,
} from "../../../../../schema/Dispatch";
import {
  createLoad,
  editLoad,
  getLoadById,
} from "../../../../../services/dispatch/dispatchServices";
import { getShipper } from "../../../../../services/shipper/shipperService";
import { getConsignee } from "../../../../../services/consignee/consigneeService";
import {
  DispatchLoadType,
  WithoutUnit,
} from "../../../../../enums/DispatchLoadType";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import OtherChargesModal from "../OtherChargesModal/OtherChargesModal";
import CarrierFeeChargeBreakDownModal from "../CarrierFeeChargeBreakDownModal/CarrierFeeChargeBreakDownModal";
import {
  DispatchLoadStatusOptions,
  DispatchLoadTypeOptions,
  equipmentOptions,
} from "../../../../../utils/dropdownOptions";
import {
  calculatePercentage,
  calculatePercentageByUnit,
} from "../../../../../utils/globalHelper";
import CurrencyNumberInput from "../../../../../components/common/CurrencyNumberInput/CurrencyNumberInput";
import TextAreaBox from "../../../../../components/common/TextAreaBox/TextAreaBox";

export type AddressForm = {
  str?: string; // Address string representation
  lat?: number; // Latitude
  lng?: number; // Longitude
};

export type ConsigneeForm = {
  consigneeId?: string; // Consignee ID as string
  address?: AddressForm; // Consignee address
  date?: Date; // Date of consignee
  time?: Date; // Optional time
  description?: string; // Optional description
  type?: string; // Optional type
  qty?: number; // Optional quantity
  weight?: number; // Optional weight
  value?: number; // Optional value
  notes?: string; // Optional notes
  PO?: number; // Optional PO number
};

export type ShipperForm = {
  shipperId?: string; // Shipper ID as string
  address?: AddressForm; // Shipper address
  date?: Date; // Date of shipper
  time?: Date; // Optional time
  description?: string; // Optional description
  type?: string; // Optional type
  qty?: number; // Optional quantity
  weight?: number; // Optional weight
  value?: number; // Optional value
  notes?: string; // Optional notes
  PO?: number; // Optional PO number
};

export type FscForm = {
  isPercentage?: boolean; // Type of FSC
  value?: number; // value of FSC
};

export type OtherChargeBreakdownForm = {
  description?: string | undefined; // Charge description
  amount?: number | undefined; // Charge amount
  isAdvance?: boolean; // Flag for advance charges
  date?: Date | undefined; // Date of charge
};

export type OtherChargeForm = {
  totalAmount: number; // Total charge amount
  breakdown: OtherChargeBreakdownForm[]; // Breakdown of charges
};

export type CarrierFeeBreakdownForm = {
  type?: DispatchLoadType; // Type of dispatch load
  rate?: number; // Agreed rate
  PDs?: number; // Number of picks/drops
  units?: number;
  fuelServiceCharge?: FscForm; // FSC details
  totalRate?: number; // Total rate after FSC and other adjustments
  OtherChargeSchema?: OtherChargeBreakdownForm[]; // Breakdown of other charges
};

export type CarrierFeeForm = {
  totalAmount?: number; // Total carrier fee
  breakdown?: CarrierFeeBreakdownForm; // Carrier fee breakdown
};

export type DispatchLoadForm = {
  _id?: string; // Optional load ID
  brokerId?: string; // Optional broker ID
  loadNumber?: number; // Optional unique load number
  WONumber?: string; // Optional unique WO number
  customerId?: string; // Optional customer ID
  carrierId?: string; // Optional carrier ID
  salesRep?: string; // Sales rep ID (assuming string for now)
  type?: DispatchLoadType; // Type of dispatch load
  PDs?: number; // Number of PDs (drops/pickups)
  fuelServiceCharge?: FscForm; // Fuel service charge
  otherCharges?: OtherChargeForm; // Other charges
  carrierFee?: CarrierFeeForm; // Carrier fee details
  equipment?: Equipment; // Equipment type (enum)
  allInRate?: number; // Optional all-in rate
  customerRate?: number; // Optional customer rate
  units?: number;
  consignee?: ConsigneeForm; // Consignee details
  shipper: ShipperForm; // Shipper details
  postedBy?: string; // Optional posted by user ID
  status?: DispatchLoadStatus; // Status of the load
  age?: Date; // Age of the load
  formattedAge?: string; // Virtual field for formatted age
  createdAt?: Date; // Timestamp of creation
  updatedAt?: Date; // Timestamp of last update
};

interface CreateOrEditDispatchLoadProps {}

const CreateOrEditDispatchLoad: FC<CreateOrEditDispatchLoadProps> = ({}) => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const { loadId } = useParams();
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("draft");
  const [loadData, setLoadData] = useState<DispatchLoadForm>();
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [brokersList, setBrokersList] = useState<any[]>([]);
  const [carriersList, setCarriersList] = useState<any[]>([]);
  const [consigneeList, setConsigneeList] = useState<any[]>([]);
  const [shipperList, setShipperList] = useState<any[]>([]);
  const [isOtherChargeOpen, setIsOtherChargeOpen] = useState(false);
  const [isCarrierFeeOpen, setIsCarrierFeeOpen] = useState(false);
  const [finalAllInRate, setFinalAllInRate] = useState(0);

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isValid },
    reset,
    watch,
  } = useForm<DispatchLoadForm>({
    mode: "onBlur",
    defaultValues: {
      brokerId: (typeof user.brokerId === "string") ? user.brokerId : "",
      postedBy: user._id,
    },
  });

  const { getData, getDataById, createData, updateData, loading, error } =
    useFetchData<any>({
      getAll: {
        user: getUsers,
        shipper: getShipper,
        consignee: getConsignee,
      },
      getById: {
        load: getLoadById,
      },
      create: {
        load: createLoad,
      },
      update: {
        load: editLoad,
      },
    });

  const fetchLoad = async (loadId: string) => {
    const result = await getDataById("load", loadId);
    if (result.success) {
      setLoadData(result.data);
    }
  };

  const fetchUsersData = async () => {
    const query = `?role=${UserRole.BROKER_USER}&isActive=true`;
    const result = await getData("user", query);
    if (result.success) {
      const users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        });
      });
      users.unshift({
        value: user._id,
        label: `${user.firstName} ${user.lastName} (${user.email}) (Admin)`,
      });
      setBrokersList(users);
    }
  };

  const fetchCustomersData = async () => {
    const query = `?role=${UserRole.CUSTOMER}&isActive=true`;
    const result = await getData("user", query);
    if (result.success) {
      const users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        });
      });
      setCustomersList(users);
    }
  };

  const fetchCarriersData = async () => {
    const query = `?role=${UserRole.CARRIER}&isActive=true`;
    const result = await getData("user", query);
    if (result.success) {
      const users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        });
      });
      setCarriersList(users);
    }
  };

  const fetchConsigneeData = async () => {
    const query = `?isActive=true`;
    const result = await getData("consignee", query);
    if (result.success) {
      const consignees: any = [];
      result?.data?.forEach((consignee) => {
        consignees.push({
          value: consignee._id,
          label: `${consignee.firstName} ${consignee.lastName} (${consignee.email})`,
          address: consignee.address,
        });
      });
      setConsigneeList(consignees);
    }
  };

  const fetchShipperData = async () => {
    const query = `?isActive=true`;
    const result = await getData("shipper", query);
    if (result.success) {
      const shippers: any = [];
      result?.data?.forEach((shipper) => {
        shippers.push({
          value: shipper._id,
          label: `${shipper.firstName} ${shipper.lastName} (${shipper.email})`,
          address: shipper.address,
        });
      });
      setShipperList(shippers);
    }
  };

  useEffect(() => {
    if (loadId) fetchLoad(loadId);
  }, [loadId]);

  useEffect(() => {
    if (loadData) {
      reset(loadData);
    }
  }, [loadData]);

  useEffect(() => {
    fetchUsersData();
    fetchCustomersData();
    fetchCarriersData();
    fetchConsigneeData();
    fetchShipperData();
  }, []);

  /**
   * Handles form submission for creating or editing a Load.
   * @param data - Form data
   */
  const submit = async (data: DispatchLoadForm) => {
    try {
      let result;
      if (loadId && loadData) {
        const validatedData = updateDispatchSchema.parse(data);
        result = await updateData("load", loadData._id!, validatedData);
      } else {
        const validatedData = transformedCreateDispatchSchema.parse(data);
        if(typeof user.brokerId === "string") validatedData.brokerId = user.brokerId;
        if(!validatedData.postedBy){
          validatedData.postedBy = user._id;
        }
        if (isDraft) {
          validatedData.status = DispatchLoadStatus.Draft;
        } else {
          validatedData.status = DispatchLoadStatus.Published;
        }
        result = await createData("load", validatedData);
      }

      if (result.success) {
        toast.success(
          loadId ? "Load updated successfully." : "Load created successfully."
        );
        navigate("/broker/dispatch-board");
      } else {
        throw new Error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const DispatchLoadTypeValue = watch("type");
  const customerRateValue = watch("customerRate");
  const unitsValue = watch("units");
  const PDs = watch("PDs");
  const fuelServiceCharge = watch("fuelServiceCharge");
  const otherCharges = watch("otherCharges");
  const allInRate = watch("allInRate"); // Ensure numeric values
  const carrierFee = watch("carrierFee");

  const calculateOtherBreakDownCharge = (
    charges: OtherChargeBreakdownForm[]
  ) => {
    if (charges?.length) {
      const totalOtherCharges = charges
        .filter((charge) => !charge.isAdvance) // Exclude advance charges
        .reduce((sum, charge) => sum + charge.amount!, 0);
      const totalAdvance =
        charges
          ?.filter((charge) => charge.isAdvance) // Include only advance charges
          .reduce((sum, charge) => sum + charge.amount!, 0) || 0;

      const finalTotalCharges = totalOtherCharges - totalAdvance;

      const data = {
        totalAmount: finalTotalCharges,
        breakdown: charges,
      };

      setValue("otherCharges", data);
      setIsOtherChargeOpen(false);
    }
  };

  const calculateCarrierFeeBreakDownCharge = (
    charges: CarrierFeeBreakdownForm
  ) => {
    setValue("carrierFee", {
      totalAmount: charges.totalRate || 0,
      breakdown: charges,
    });
    setIsCarrierFeeOpen(false);
  };

  // useEffect for all-in rate calculation
  useEffect(() => {
    let calculatedRate = 0;

    if (customerRateValue) {
      calculatedRate +=
        unitsValue && !isNaN(unitsValue)
          ? customerRateValue * unitsValue
          : customerRateValue;
    }

    if (PDs) {
      calculatedRate += PDs;
    }

    if (fuelServiceCharge?.value) {
      if (fuelServiceCharge.isPercentage && customerRateValue) {
        calculatedRate += unitsValue
          ? calculatePercentageByUnit(
              customerRateValue,
              fuelServiceCharge.value,
              unitsValue
            )
          : calculatePercentage(customerRateValue, fuelServiceCharge.value);
      } else {
        calculatedRate += fuelServiceCharge.value;
      }
    }

    if (otherCharges?.totalAmount) {
      calculatedRate += otherCharges.totalAmount;
    }

    // Update the final all-in rate if it changes
    if (calculatedRate !== finalAllInRate) {
      setFinalAllInRate(calculatedRate);
      setValue("allInRate", calculatedRate);
    }
  }, [
    customerRateValue,
    unitsValue,
    PDs,
    fuelServiceCharge?.value,
    otherCharges?.totalAmount,
    finalAllInRate, // Prevent redundant updates
    setValue,
  ]);

  // UseMemo to optimize the computation
  const marginPercentage = useMemo(() => {
    if (allInRate === 0 || !allInRate) {
      return 0; // Avoid division by zero
    }
    const totalCarrierFee = carrierFee?.totalAmount || 0;
    const margin = ((allInRate - totalCarrierFee) / allInRate) * 100;
    return margin.toFixed(2); // Return percentage with 2 decimal places
  }, [allInRate, carrierFee?.totalAmount]);

  const calculateFuelServiceCharge = useMemo(() => {
    if (customerRateValue) {
      if (unitsValue) {
        return (
          calculatePercentageByUnit(
            customerRateValue,
            fuelServiceCharge?.value!,
            unitsValue
          ) || 0
        );
      }
      return (
        calculatePercentage(customerRateValue, fuelServiceCharge?.value!) || 0
      );
    }
    return 0;
  }, [customerRateValue, fuelServiceCharge?.value, unitsValue]);

  return (
    <>
      <h2 className="fw-bold">
        {loadId
          ? `Edit ${isDraft ? "Pending" : "Active"} Load`
          : `New ${isDraft ? "Pending" : "Active"} Load`}
      </h2>

      {/* Show loader during API calls */}
      {loading && <Loading />}

      {/* Display error message if API fails */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(submit)}>
        <div className="row">
          {/* Load/Reference Number */}
          <div className="col-3">
            <NumberInput
              label="Load / Reference Number"
              id="loadNumber"
              name="loadNumber"
              disabled={loadId && !isDraft ? true : false}
              placeholder="Enter Load / Reference Number"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* Bill To */}
          <div className="col-3">
            <SelectField
              label="Bill To"
              name="customerId"
              placeholder="Select Customer"
              control={control}
              options={customersList}
              rules={{
                required: {
                  value: loadId
                    ? isDraft
                      ? watch("status") === DispatchLoadStatus.Published
                      : true
                    : !isDraft,
                  message: "Please select a customer",
                },
              }}
            />
          </div>

          {/* Dispatcher */}
          <div className="col-3">
            <SelectField
              label="Dispatcher"
              name="brokerId"
              placeholder="Select Dispatcher"
              control={control}
              options={brokersList}
            />
          </div>

          {/* Sales Rep */}
          <div className="col-3">
            <SelectField
              label="Sales Rep"
              name="salesRep"
              placeholder="Select Sales Rep"
              control={control}
              options={brokersList}
            />
          </div>
          {/* status */}
          {loadId && (
            <div className="col-3">
              <SelectField
                label="Status"
                name="status"
                placeholder="Select Status"
                control={control}
                options={
                  watch("status") == DispatchLoadStatus.Draft
                    ? DispatchLoadStatusOptions.filter(
                        (s) => s.value == DispatchLoadStatus.Published
                      )
                    : DispatchLoadStatusOptions.filter(
                        (s) => s.value !== DispatchLoadStatus.Draft
                      )
                }
              />
            </div>
          )}

          {/* W/O Number */}
          <div className="col-3">
            <Input
              label="W/O Number"
              type="text"
              id="WONumber"
              name="WONumber"
              placeholder="Enter W/O Number"
              control={control}
            />
          </div>

          {/* Type */}
          <div className="col-3">
            <SelectField
              label="Type"
              name="type"
              placeholder="Select Type"
              control={control}
              options={DispatchLoadTypeOptions}
            />
          </div>

          {/* Customer All-in Rate*/}
          <div className="col-2">
            <CurrencyNumberInput
              label="Rate"
              id="customerRate"
              name="customerRate"
              placeholder="Enter Rate"
              control={control}
              currency
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* Conditionally show Unit Number if 'Pallets' is selected */}
          {DispatchLoadTypeValue &&
            !WithoutUnit.includes(DispatchLoadTypeValue) && (
              <div className="col-2">
                <NumberInput
                  label="Units"
                  id="units"
                  name="units"
                  placeholder="Enter units"
                  control={control}
                  rules={{
                    min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                  }}
                />
              </div>
            )}

          {/* Picks/Drops */}
          <div className="col-2">
            <NumberInput
              label="P/Ds"
              id="PDs"
              name="PDs"
              placeholder="Enter Picks/Drops"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* F.S.C */}
          <div className="col-2 position-relative">
            <NumberInput
              label="F.S.C"
              id="fuelServiceCharge.value"
              name="fuelServiceCharge.value"
              placeholder={
                watch("fuelServiceCharge.isPercentage")
                  ? "Enter Percentage"
                  : "Enter F.S.C"
              }
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                max: {
                  value: watch("fuelServiceCharge.isPercentage")
                    ? 100
                    : Infinity,
                  message: VALIDATION_MESSAGES.percentageRange,
                },
              }}
            />

            <div className="position-absolute top-0 end-0">
              <CheckboxField
                label="Rate %"
                id="fuelServiceCharge.isPercentage"
                name="fuelServiceCharge.isPercentage"
                control={control}
                onChange={() => setValue("fuelServiceCharge.value", 0)}
              />
            </div>
          </div>
          {fuelServiceCharge?.isPercentage && (
            <div className="col-1">
              <div>Amount</div>
              <div className="fw-bold">{calculateFuelServiceCharge} $</div>
            </div>
          )}

          {/* Other Charge */}
          <div className="col-2 position-relative">
            <NumberInput
              label="Other Charges"
              id="otherCharges.totalAmount"
              name="otherCharges.totalAmount"
              placeholder="Enter Other Charges"
              control={control}
            />
            <div className="position-absolute top-0" style={{ right: "15px" }}>
              <img
                src={PlusIcon}
                height={20}
                width={20}
                className="bg-primary p-1 rounded"
                onClick={() => setIsOtherChargeOpen(true)}
              />
            </div>
          </div>

          {/* All-in Rate*/}
          <div className="col-2">
            <CurrencyNumberInput
              label="All-in Rate"
              id="allInRate"
              name="allInRate"
              placeholder="Enter All-in Rate"
              control={control}
              currency
            />
          </div>

          {/* Percentage */}
          <div className="col-1">
            <div>Percent</div>
            <div className="fw-bold">{marginPercentage} %</div>
          </div>

          {/* Equipment */}
          <div className="col-3">
            <SelectField
              label="Equipment"
              name="equipment"
              placeholder="Select Equipment"
              control={control}
              options={equipmentOptions}
              rules={{
                required: {
                  value: loadId
                    ? isDraft
                      ? watch("status") === DispatchLoadStatus.Published
                      : true
                    : !isDraft,
                  message: "Please select Equipment",
                },
              }}
            />
          </div>

          {/* Carrier */}
          <div className="col-3">
            <SelectField
              label="Select Carrier"
              name="carrierId"
              placeholder="Select Carrier"
              control={control}
              options={carriersList}
              rules={{
                required: {
                  value: loadId
                    ? isDraft
                      ? watch("status") === DispatchLoadStatus.Published
                      : true
                    : !isDraft,
                  message: "Please select a carrier",
                },
              }}
            />
          </div>

          {/* Carrier Fee */}
          <div className="col-4 position-relative">
            <NumberInput
              label="Carrier Fee"
              id="carrierFee.totalAmount"
              name="carrierFee.totalAmount"
              placeholder="Enter Carrier Fee"
              control={control}
            />
            <div className="position-absolute top-0" style={{ right: "15px" }}>
              <img
                src={PlusIcon}
                height={20}
                width={20}
                className="bg-primary p-1 rounded"
                onClick={() => setIsCarrierFeeOpen(true)}
              />
            </div>
          </div>

          {/* Assign User */}
          <div className="col-3">
            <SelectField
              label="Assign User"
              name="postedBy"
              placeholder="Select User"
              control={control}
              options={brokersList}
            />
          </div>

          {/** Shipper Part */}

          <div className="col-12">
            <h4 className="fw-bold mb-0">Shipper</h4>
          </div>
          <hr className="my-2" />

          {/* Shipper */}
          <div className="col-3">
            <SelectField
              label="Shipper"
              name="shipper.shipperId"
              placeholder="Select Shipper"
              control={control}
              options={shipperList}
              onChangeOption={(selectedOption) => {
                shipperList.forEach((shipper) => {
                  if (shipper.value === selectedOption?.value) {
                    setValue("shipper.address", shipper.address);
                  }
                });
              }}
            />
          </div>

          {/* Location */}
          <div className="col-3">
            <PlaceAutocompleteField
              name="shipper.address"
              label="Location"
              control={control}
              placeholder="Enter address"
              setValue={setValue}
            />
          </div>

          {/* Pickup Date*/}
          <div className="col-2">
            <DateInput
              name="shipper.date"
              control={control}
              label="Date"
              placeholder="Choose a date"
              datePickerProps={{
                dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                minDate: new Date(), // Disable past dates
              }}
            />
          </div>

          {/* Pickup Time*/}
          <div className="col-2">
            <DateInput
              name="shipper.time"
              control={control}
              label="Time"
              placeholder="Choose a Time"
              datePickerProps={{
                showTimeSelectOnly: true,
                timeCaption: "Time",
                showTimeSelect: true,
                dateFormat: "h:mm aa",
              }}
            />
          </div>

          {/* Type */}
          <div className="col-2">
            <Input
              id="shipper.type"
              label="Type"
              name="shipper.type"
              placeholder="Enter Type(TL, LTS, PALLET etc.)"
              control={control}
            />
          </div>

          {/* Description */}
          <div className="col-6">
            <TextAreaBox
              label="Description"
              id="shipper.description"
              name="shipper.description"
              placeholder="Enter a detailed description"
              control={control}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="col-6">
            <TextAreaBox
              label="Shipping Notes"
              id="shipper.notes"
              name="shipper.notes"
              placeholder="Enter a detailed notes"
              control={control}
              rows={3}
            />
          </div>

          {/* qty */}
          <div className="col-2">
            <NumberInput
              label="Qty"
              id="shipper.qty"
              name="shipper.qty"
              placeholder="Qty"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* weight */}
          <div className="col-2">
            <NumberInput
              label="Weight(Ibs)"
              id="shipper.weight"
              name="shipper.weight"
              placeholder="Weight (Ibs.)"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* Value */}
          <div className="col-2">
            <NumberInput
              label="Value($)"
              id="shipper.value"
              name="shipper.value"
              placeholder="Value"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* P/O Number */}
          <div className="col-2">
            <NumberInput
              label="P/O Number"
              id="shipper.PO"
              name="shipper.PO"
              placeholder="Enter P/O Number"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/** Consignee Part */}
          <div className="col-12">
            <h4 className="fw-bold mb-0">Consignee</h4>
          </div>

          <hr className="my-2" />

          {/* Consignee */}
          <div className="col-3">
            <SelectField
              label="Consignee"
              name="consignee.consigneeId"
              placeholder="Select Consignee"
              control={control}
              options={consigneeList}
              onChangeOption={(selectedOption) => {
                consigneeList.forEach((consignee) => {
                  if (consignee.value === selectedOption?.value) {
                    setValue("consignee.address", consignee.address);
                  }
                });
              }}
            />
          </div>

          {/* Location */}
          <div className="col-3">
            <PlaceAutocompleteField
              name="consignee.address"
              label="Location"
              control={control}
              placeholder="Enter address"
              setValue={setValue}
            />
          </div>

          {/* Delivery Date*/}
          <div className="col-2">
            <DateInput
              name="consignee.date"
              control={control}
              label="Date"
              placeholder="Choose a date"
              datePickerProps={{
                dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                minDate: new Date(), // Disable past dates
              }}
            />
          </div>

          {/* Delivery Time*/}
          <div className="col-2">
            <DateInput
              name="consignee.time"
              control={control}
              label="Time"
              placeholder="Choose a Time"
              datePickerProps={{
                showTimeSelectOnly: true,
                timeCaption: "Time",
                showTimeSelect: true,
                dateFormat: "h:mm aa",
              }}
            />
          </div>

          {/* Type */}
          <div className="col-2">
            <Input
              id="consignee.type"
              label="Type"
              name="consignee.type"
              placeholder="Enter Type(TL, LTS, PALLET etc.)"
              control={control}
            />
          </div>

          {/* Description */}
          <div className="col-6">
            <TextAreaBox
              label="Description"
              id="consignee.description"
              name="consignee.description"
              placeholder="Enter a detailed description"
              control={control}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="col-6">
            <TextAreaBox
              label="Delivery Notes"
              id="consignee.notes"
              name="consignee.notes"
              placeholder="Enter a detailed notes"
              control={control}
              rows={3}
            />
          </div>

          {/* qty */}
          <div className="col-2">
            <NumberInput
              label="Qty"
              id="consignee.qty"
              name="consignee.qty"
              placeholder="Qty"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* weight */}
          <div className="col-2">
            <NumberInput
              label="Weight(Ibs)"
              id="consignee.weight"
              name="consignee.weight"
              placeholder="Weight (Ibs.)"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* Value */}
          <div className="col-2">
            <NumberInput
              label="Value($)"
              id="consignee.value"
              name="consignee.value"
              placeholder="Value"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>

          {/* P/O Number */}
          <div className="col-2">
            <NumberInput
              label="P/O Number"
              id="consignee.PO"
              name="consignee.PO"
              placeholder="Enter P/O Number"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>
           {/* Submit Buttons */}
          <div className="col-12 text-center d-flex justify-content-center">
            <button
              className="btn btn-outline btn-lg"
              type="button"
              onClick={() => navigate("/broker/dispatch-board")}
            >
              Cancel
            </button>
            <button
              className="btn btn-accent btn-lg"
              type="submit"
              disabled={!isValid || loading}
              onClick={handleSubmit(submit)}
            >
              {loadId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>

      {isOtherChargeOpen && (
        <OtherChargesModal
          isOpen={isOtherChargeOpen}
          title="Other Charges"
          calculateOtherBreakDownCharge={calculateOtherBreakDownCharge}
          data={getValues("otherCharges.breakdown")}
          onClose={() => setIsOtherChargeOpen(false)}
        />
      )}

      {isCarrierFeeOpen && (
        <CarrierFeeChargeBreakDownModal
          isOpen={isCarrierFeeOpen}
          title="Carrier Charges"
          calculateCarrierFeeBreakDownCharge={
            calculateCarrierFeeBreakDownCharge
          }
          data={getValues("carrierFee.breakdown")}
          onClose={() => setIsCarrierFeeOpen(false)}
        />
      )}
    </>
  );
};

export default CreateOrEditDispatchLoad;
