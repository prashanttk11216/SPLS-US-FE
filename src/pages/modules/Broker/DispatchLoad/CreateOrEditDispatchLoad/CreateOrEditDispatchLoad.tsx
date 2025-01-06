import { FC, useEffect, useState } from "react";
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
import { Address } from "../../../../../types/Address";
import { DispatchLoadStatus } from "../../../../../enums/DispatchLoadStatus";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import Input from "../../../../../components/common/Input/Input";
import {
  createDispatchSchema,
  updateDispatchSchema,
} from "../../../../../schema/Dispatch";
import {
  createLoad,
  editLoad,
  getLoadById,
} from "../../../../../services/dispatch/dispatchServices";
import { getShipper } from "../../../../../services/shipper/shipperService";
import { getConsignee } from "../../../../../services/consignee/consigneeService";

export type AddressForm = {
  str: string; // Address string representation
  lat: number; // Latitude
  lng: number; // Longitude
};

export type ConsigneeForm = {
  consigneeId: string; // ObjectId as string
  address: AddressForm;
  date: Date; // Date of consignee
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
  shipperId: string; // ObjectId as string
  address: AddressForm;
  date: Date; // Date of shipper
  time?: Date; // Optional time
  description?: string; // Optional description
  type?: string; // Optional type
  qty?: number; // Optional quantity
  weight?: number; // Optional weight
  value?: number; // Optional value
  notes?: string; // Optional notes
  PO?: number; // Optional PO number
};

export type DispatchLoadForm = {
  _id?: string; // Optional load ID
  brokerId?: string; // Optional broker ID
  loadNumber?: number; // Optional unique load number
  WONumber?: number; // Optional unique WO number
  customerId?: string; // Optional customer ID
  carrierId?: string; // Optional carrier ID
  equipment: Equipment; // Equipment type (enum)
  allInRate?: number; // Optional all-in rate
  carrierRate?: number; // Optional carrier rate
  consignee: ConsigneeForm; // Consignee details
  shipper: ShipperForm; // Shipper details
  postedBy?: string; // Optional posted by user ID
  status?: DispatchLoadStatus; // Status enum
};

interface CreateOrEditDispatchLoadProps {}

const CreateOrEditDispatchLoad: FC<CreateOrEditDispatchLoadProps> = ({}) => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const { loadId } = useParams();
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("draft");
  const [loadData, setLoadData] = useState<DispatchLoadForm>();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [brokersList, setBrokersList] = useState<any[]>([]);
  const [carriersList, setCarriersList] = useState<any[]>([]);
  const [consigneeList, setConsigneeList] = useState<any[]>([]);
  const [shipperList, setShipperList] = useState<any[]>([]);


  const equipmentOptions = Object.entries(Equipment).map(([_, value]) => ({
    value: value,
    label: value,
  }));

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
    reset,
  } = useForm<DispatchLoadForm>({
    mode: "onBlur",
  });

  const {
    createData: newLoad,
    updateData: updateLoad,
    fetchDataById: fetchLoadById,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createLoad,
    updateDataService: editLoad,
    fetchByIdService: getLoadById,
  });

  const { fetchData: fetchShipper } = useFetchData<any>({
    fetchDataService: getShipper,
  });

  const { fetchData: fetchConsignee } = useFetchData<any>({
    fetchDataService: getConsignee,
  });

  const { fetchData: fetchUsers } = useFetchData<any>({
    fetchDataService: getUsers,
  });

  const fetchLoad = async (loadId: string) => {
    const result = await fetchLoadById(loadId);
    if (result.success) {
      setLoadData(result.data);
    }
  };

  const fetchUsersData = async () => {
    let query = `?role=${UserRole.BROKER_USER}&isActive=true`;
    const result = await fetchUsers(query);
    if (result.success) {
      let users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        });
      });
      users.unshift({
        value: user._id,
        label: `${user.firstName} ${user.lastName} (${user.email}) (Admin)`,
      })
      setUsersList(users);
    }
  };

  const fetchCustomersData = async () => {
    let query = `?role=${UserRole.CUSTOMER}&isActive=true`;
    const result = await fetchUsers(query);
    if (result.success) {
      let users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        });
      });
      setCustomersList(users);
    }
  };

  const fetchBrokersData = async () => {
    let query = `?role=${UserRole.BROKER_ADMIN}&isActive=true`;
    const result = await fetchUsers(query);
    if (result.success) {
      let users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.company} (${user.email})`,
        });
      });
      setBrokersList(users);
    }
  };

  const fetchCarriersData = async () => {
    let query = `?role=${UserRole.CARRIER}&isActive=true`;
    const result = await fetchUsers(query);
    if (result.success) {
      let users: any = [];
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
    let query = `?isActive=true`;
    const result = await fetchConsignee(query);
    if (result.success) {
      let consignees: any = [];
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
    let query = `?isActive=true`;
    const result = await fetchShipper(query);
    if (result.success) {
      let shippers: any = [];
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
    fetchBrokersData();
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
        result = await updateLoad(loadData._id!, validatedData);
      } else {
        const validatedData = createDispatchSchema.parse(data);
        if (!isDraft) {
          validatedData.status = DispatchLoadStatus.Published;
        }
        result = await newLoad(validatedData);
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

  const handlePlaceSelect = (details: Address) => {
    setValue("shipper.address", {
      str: details.formatted_address!,
      lat: details.lat!,
      lng: details.lng!,
    });
  };

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
          {/* Bill To */}
          <div className="col-3">
            <SelectField
              label="Bill To"
              name="customerId"
              placeholder="Select Customer"
              control={control}
              options={customersList}
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
          {/* Equipment */}
          <div className="col-3">
            <SelectField
              label="Equipment"
              name="equipment"
              placeholder="Select Equipment"
              control={control}
              options={equipmentOptions}
              rules={{ required: "Please select Equipment" }}
            />
          </div>
          {/* All-in Rate*/}
          <div className="col-3">
            <NumberInput
              label="All-in Rate"
              id="allInRate"
              name="allInRate"
              placeholder="Enter All-in Rate"
              control={control}
              currency
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
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
            />
          </div>
          {/* W/O Number */}
          <div className="col-3">
            <NumberInput
              label="W/O Number"
              id="WONumber"
              name="WONumber"
              disabled={loadId ? true : false}
              placeholder="Enter W/O Number"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>
          {/* Load/Reference Number */}
          <div className="col-3">
            <NumberInput
              label="Load / Reference Number"
              id="loadNumber"
              name="loadNumber"
              disabled={loadId ? true : false}
              placeholder="Enter Load / Reference Number"
              control={control}
              rules={{
                min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
              }}
            />
          </div>
          {/* Assign User */}
          <div className="col-3">
            <SelectField
              label="Assign User"
              name="postedBy"
              placeholder="Select User"
              control={control}
              options={usersList}
            />
          </div>

          <div className="col-12">
            <h4 className="fw-bold mb-0">Shipper</h4>
          </div>
          <hr />
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
              rules={{ required: VALIDATION_MESSAGES.addressRequired }}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
          {/* Pickup Date*/}
          <div className="col-2">
            <DateInput
              name="shipper.date"
              control={control}
              label="Date"
              required={true}
              placeholder="Choose a date"
              rules={{
                required: VALIDATION_MESSAGES.dateRequired,
              }}
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
            <SelectField
              label="Type"
              name="shipper.type"
              placeholder="Select Type"
              control={control}
              options={equipmentOptions}
            />
          </div>
          {/* Description */}
          <div className="col-6">
            <Input
              label="Description"
              id="shipper.description"
              name="shipper.description"
              placeholder="Enter a detailed description"
              control={control}
              isTextArea
              rows={3}
            />
          </div>
          {/* Notes */}
          <div className="col-6">
            <Input
              label="Shipping Notes"
              id="shipper.notes"
              name="shipper.notes"
              placeholder="Enter a detailed notes"
              control={control}
              isTextArea
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
          <div className="col-12">
            <h4 className="fw-bold mb-0">Consignee</h4>
          </div>
          <hr />
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
              rules={{ required: VALIDATION_MESSAGES.addressRequired }} // Example validation
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
          {/* Delivery Date*/}
          <div className="col-2">
            <DateInput
              name="consignee.date"
              control={control}
              label="Date"
              required={true}
              placeholder="Choose a date"
              rules={{
                required: VALIDATION_MESSAGES.dateRequired,
              }}
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
            <SelectField
              label="Type"
              name="consignee.type"
              placeholder="Select Type"
              control={control}
              options={equipmentOptions}
            />
          </div>
          {/* Description */}
          <div className="col-6">
            <Input
              label="Description"
              id="consignee.description"
              name="consignee.description"
              placeholder="Enter a detailed description"
              control={control}
              isTextArea
              rows={3}
            />
          </div>
          {/* Notes */}
          <div className="col-6">
            <Input
              label="Delivery Notes"
              id="consignee.notes"
              name="consignee.notes"
              placeholder="Enter a detailed notes"
              control={control}
              isTextArea
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

          <div className="col-12 text-center d-flex justify-content-center">
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
    </>
  );
};

export default CreateOrEditDispatchLoad;
