import { FC, useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import {
  createLoad,
  editLoad,
  getLoadById,
} from "../../../../../services/load/loadServices";
import { useNavigate, useParams } from "react-router-dom";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField, { SelectOption } from "../../../../../components/common/SelectField/SelectField";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import { UserRole } from "../../../../../enums/UserRole";
import { getUsers } from "../../../../../services/user/userService";
import { baseLoadSchema, createLoadSchema, updateLoadSchema } from "../../../../../schema/Load";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import calculateDistance, {
  formatDistance,
} from "../../../../../utils/distanceCalculator";
import MapModal from "../../../../../components/common/MapModal/MapModal";
import { commodityOptions, equipmentOptions, loadOptions, modeOptions } from "../../../../../utils/dropdownOptions";
import CurrencyNumberInput from "../../../../../components/common/CurrencyNumberInput/CurrencyNumberInput";
import TextAreaBox from "../../../../../components/common/TextAreaBox/TextAreaBox";
import { z } from "zod";
import { hasAccess } from "../../../../../utils/permissions";

export type LoadForm = z.infer<typeof baseLoadSchema>;

interface CreateOrEditLoadProps {}

const CreateOrEditLoad: FC<CreateOrEditLoadProps> = ({}) => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const { loadId } = useParams();
  const [loadData, setLoadData] = useState<LoadForm>();
  const [usersList, setUsersList] = useState<SelectOption[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<
    { value: string; label: string; email: string }[]
  >([]);

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isValid },
    reset,
    watch,
  } = useForm<LoadForm>({
    mode: "onBlur",
  });

  const {
    getData,       // Fetch all data for any entity
    getDataById,   // Fetch a single item by ID
    createData,    // Create new item
    updateData,    // Update existing item
    loading,
    error,
  } = useFetchData<any>({
    getAll: {
      users: getUsers,
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
    const result = await getDataById("load",loadId);
    if (result.success) {
      setLoadData(result.data);
    }
  };

  const fetchUsersData = async () => {
    const query = `?role=${UserRole.BROKER_USER}&isActive=true`;
    const result = await getData("users",query);
    if (result.success) {
      const users: any = [];
      result?.data?.forEach((user) => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        });
      });
      setUsersList(users);
    }
  };

  const fetchCustomersData = useCallback(async () => {
      try {
        const query = `?role=${UserRole.CUSTOMER}&isActive=true`;
        const result = await getData("users", query);
        if (result.success) {
          const users = result?.data?.map((user) => ({
            value: user._id,
            label: `${user.firstName} ${user.lastName} (${user.email})`,
            email: user?.email,
          }));
          setCustomersList(users || []);
        } else {
          toast.error("Failed to fetch customers.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching customers.");
      }
    }, [getData]);

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
  }, []);

  const {
    fields: originFields,
    append: appendOrigin,
    remove: removeOrigin,
  } = useFieldArray({
    control,
    name: "originStops",
  });

  const {
    fields: destinationFields,
    append: appendDestination,
    remove: removeDestination,
  } = useFieldArray({
    control,
    name: "destinationStops",
  });

  const addOriginStop = () => {
    appendOrigin({
      address: {
        str: "",
        lat: 0,
        lng: 0,
      },
      earlyPickupDate: "",
      latePickupDate: "",
      earlyPickupTime: "",
      latePickupTime: "",
    });
  };

  const addDestinationStop = () => {
    appendDestination({
      address: {
        str: "",
        lat: 0,
        lng: 0,
      },
      earlyDropoffDate: "",
      lateDropoffDate: "",
      earlyDropoffTime: "",
      lateDropoffTime: "",
    });
  };

  /**
   * Handles form submission for creating or editing a Load.
   * @param data - Form data
   */
  const submit = async (data: LoadForm) => {
    try {
      let result;
      if (loadId && loadData) {
        const validatedData = updateLoadSchema.parse(data);
        result = await updateData("load", loadData._id!, validatedData);
      } else {
        if(typeof user.brokerId === "string") data.brokerId = user.brokerId;
        if(!data.postedBy){
          data.postedBy = user._id;
        }
        const validatedData = createLoadSchema.parse(data);
        result = await createData("load",validatedData);
      }

      if (result.success) {
        toast.success(
          loadId ? "Load updated successfully." : "Load created successfully."
        );
        navigate("/broker/load-board");
      } else {
        throw new Error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const getDistance = async () => {
    const originData = {
      lat: getValues("origin").lat,
      lng: getValues("origin").lng,
    };
    const destinationData = {
      lat: getValues("destination").lat,
      lng: getValues("destination").lng,
    };

    try {
      const distance = await calculateDistance(originData, destinationData);
      return distance;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const origin = watch("origin");
  const destination = watch("destination");

  useEffect(() => {
    const calculateDistance = async () => {
      if (origin && destination) {
        const distance: number = await getDistance();
        setValue("miles", formatDistance(distance));
      }
    };

    calculateDistance();
  }, [origin, destination]);

  return (
    <>
      <h2 className="fw-bold">{loadId ? "Edit Load" : "Create Load"}</h2>

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
          <div className="col-12">
            <h3 className="fw-lighter">Origin</h3>
          </div>
          {/* Origin */}
          <div className="col-4">
            <PlaceAutocompleteField
              name="origin"
              label="Origin City & State, or Zip Code"
              control={control}
              placeholder="Enter Origin City & State, or Zip Code"
              setValue={setValue}
              rules={{ 
                required: VALIDATION_MESSAGES.originRequired,
                validate: (value: any) => (value?.str ? true : VALIDATION_MESSAGES.originRequired)
              }}
            />
          </div>
          {/* Origin Early Pickup Date*/}
          <div className="col-2">
            <DateInput
              name="originEarlyPickupDate"
              control={control}
              label="Early Pick-Up Date"
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
          {/* Origin Early Pickup Time*/}
          <div className="col-2">
            <DateInput
              name="originEarlyPickupTime"
              control={control}
              label="Early Pick-Up Time"
              placeholder="Choose a Time"
              datePickerProps={{
                showTimeSelectOnly: true,
                timeCaption: "Time",
                showTimeSelect: true,
                dateFormat: "h:mm aa",
              }}
            />
          </div>
          {/* Origin Late Pickup Date*/}
          <div className="col-2">
            <DateInput
              name="originLatePickupDate"
              control={control}
              label="Late Pick-Up Date"
              placeholder="Choose a date"
              datePickerProps={{
                dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                minDate: new Date(), // Disable past dates
              }}
            />
          </div>
          {/* Origin Late Pickup Time*/}
          <div className="col-2">
            <DateInput
              name="originLatePickupTime"
              control={control}
              label="Late Pick-Up Time"
              placeholder="Choose a Time"
              datePickerProps={{
                showTimeSelectOnly: true,
                timeCaption: "Time",
                showTimeSelect: true,
                dateFormat: "h:mm aa",
              }}
            />
          </div>

          {originFields.map((item, index) => (
            <div
              key={item.id}
              className="col-12 mb-2 border-top border-bottom border-secondary border-2"
            >
              <div className="row py-2">
                {/* delete */}
                <div className="col-12 d-flex align-items-center justify-content-between mb-2">
                  <h4 className="fw-lighter">Stop {index + 1}</h4>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeOrigin(index)}
                  >
                    delete
                  </button>
                </div>
                {/* Stop City & State, or Zip Code*/}
                <div className="col-4">
                  <PlaceAutocompleteField
                    name={`originStops.${index}.address`}
                    label={`Stop ${index + 1} City & State, or Zip Code`}
                    control={control}
                    placeholder={`Enter Stop ${
                      index + 1
                    } City & State, or Zip Code`}
                    setValue={setValue}
                    rules={{ 
                      required: VALIDATION_MESSAGES.originRequired,
                      validate: (value: any) => (value?.str ? true : VALIDATION_MESSAGES.originRequired)
                    }}
                   />
                </div>
                {/* Origin Early Pickup Date*/}
                <div className="col-2">
                  <DateInput
                    name={`originStops.${index}.earlyPickupDate`}
                    control={control}
                    label="Early Pick-Up Date"
                    placeholder="Choose a date"
                    datePickerProps={{
                      dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                      minDate: new Date(), // Disable past dates
                    }}
                  />
                </div>
                {/* Origin Early Pickup Time*/}
                <div className="col-2">
                  <DateInput
                    name={`originStops.${index}.earlyPickupTime`}
                    control={control}
                    label="Early Pick-Up Time"
                    placeholder="Choose a Time"
                    datePickerProps={{
                      showTimeSelectOnly: true,
                      timeCaption: "Time",
                      showTimeSelect: true,
                      dateFormat: "h:mm aa",
                    }}
                  />
                </div>
                {/* Origin Late Pickup Date*/}
                <div className="col-2">
                  <DateInput
                    name={`originStops.${index}.latePickupDate`}
                    control={control}
                    label="Late Pick-Up Date"
                    placeholder="Choose a date"
                    datePickerProps={{
                      dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                      minDate: new Date(), // Disable past dates
                    }}
                  />
                </div>
                {/* Origin Late Pickup Time*/}
                <div className="col-2">
                  <DateInput
                    name={`originStops.${index}.latePickupTime`}
                    control={control}
                    label="Late Pick-Up Time"
                    placeholder="Choose a Time"
                    datePickerProps={{
                      showTimeSelectOnly: true,
                      timeCaption: "Time",
                      showTimeSelect: true,
                      dateFormat: "h:mm aa",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Button to add an origin stop */}
          <div className="col-12 text-center my-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addOriginStop}
            >
              Add Origin Stop
            </button>
          </div>

          <div className="col-12">
            <h3 className="fw-lighter">Destination</h3>
          </div>

          {/* Destination */}
          <div className="col-4">
            <PlaceAutocompleteField
              name="destination"
              label="Destination City & State, or Zip Code"
              control={control}
              placeholder="Enter Destination City & State, or Zip Code"
              setValue={setValue}
              rules={{ 
                required: VALIDATION_MESSAGES.destinationRequired,
                validate: (value: any) => (value?.str ? true : VALIDATION_MESSAGES.destinationRequired)
              }}
            />
          </div>
          {/* Destination Early drop-off Date*/}
          <div className="col-2">
            <DateInput
              name="destinationEarlyDropoffDate"
              control={control}
              label="Early Drop-off Date"
              placeholder="Choose a date"
              datePickerProps={{
                dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                minDate: new Date(), // Disable past dates
              }}
            />
          </div>
          {/* Destination Early drop-off Time*/}
          <div className="col-2">
            <DateInput
              name="destinationEarlyDropoffTime"
              control={control}
              label="Early Drop-off Time"
              placeholder="Choose a Time"
              datePickerProps={{
                showTimeSelectOnly: true,
                timeCaption: "Time",
                showTimeSelect: true,
                dateFormat: "h:mm aa",
              }}
            />
          </div>
          {/* Destination Late drop-off Date*/}
          <div className="col-2">
            <DateInput
              name="destinationLateDropoffDate"
              control={control}
              label="Late Drop-off Date"
              placeholder="Choose a date"
              datePickerProps={{
                dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                minDate: new Date(), // Disable past dates
              }}
            />
          </div>
          {/* Destination Late drop-off Time*/}
          <div className="col-2">
            <DateInput
              name="destinationLateDropoffTime"
              control={control}
              label="Late Drop-off Time"
              placeholder="Choose a Time"
              datePickerProps={{
                showTimeSelectOnly: true,
                timeCaption: "Time",
                showTimeSelect: true,
                dateFormat: "h:mm aa",
              }}
            />
          </div>

          {destinationFields.map((item, index) => (
            <div
              key={item.id}
              className="col-12 mb-2 border-top border-bottom border-secondary border-2"
            >
              <div className="row py-2">
                {/* delete */}
                <div className="col-12 d-flex align-items-center justify-content-between mb-2">
                  <h4 className="fw-lighter">Stop {index + 1}</h4>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeDestination(index)}
                  >
                    delete
                  </button>
                </div>
                {/* Stop City & State, or Zip Code*/}
                <div className="col-4">
                  <PlaceAutocompleteField
                    name={`destinationStops.${index}.address`}
                    label={`Stop ${index + 1} City & State, or Zip Code`}
                    control={control}
                    placeholder={`Enter Stop ${
                      index + 1
                    } City & State, or Zip Code`}
                    setValue={setValue}
                    rules={{ 
                      required: VALIDATION_MESSAGES.destinationRequired,
                      validate: (value: any) => (value?.str ? true : VALIDATION_MESSAGES.destinationRequired)
                    }}
                  />
                </div>
                {/* Early Drop-off Date */}
                <div className="col-2">
                  <DateInput
                    name={`destinationStops.${index}.earlyDropoffDate`}
                    control={control}
                    label="Early Drop-off Date"
                    placeholder="Choose a date"
                    datePickerProps={{
                      dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                      minDate: new Date(), // Disable past dates
                    }}
                  />
                </div>
                {/* Early Drop-off Time*/}
                <div className="col-2">
                  <DateInput
                    name={`destinationStops.${index}.earlyDropoffTime`}
                    control={control}
                    label="Early Drop-off Time"
                    placeholder="Choose a Time"
                    datePickerProps={{
                      showTimeSelectOnly: true,
                      timeCaption: "Time",
                      showTimeSelect: true,
                      dateFormat: "h:mm aa",
                    }}
                  />
                </div>
                {/* Late Drop-off Date*/}
                <div className="col-2">
                  <DateInput
                    name={`destinationStops.${index}.lateDropoffDate`}
                    control={control}
                    label="Late Drop-off Date"
                    placeholder="Choose a date"
                    datePickerProps={{
                      dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                      minDate: new Date(), // Disable past dates
                    }}
                  />
                </div>
                {/* Late Drop-off Time */}
                <div className="col-2">
                  <DateInput
                    name={`destinationStops.${index}.lateDropoffTime`}
                    control={control}
                    label="Late Drop-off Time"
                    placeholder="Choose a Time"
                    datePickerProps={{
                      showTimeSelectOnly: true,
                      timeCaption: "Time",
                      showTimeSelect: true,
                      dateFormat: "h:mm aa",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Button to add Destination stop */}
          <div className="col-12 text-center my-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addDestinationStop}
            >
              Add Destination Stop
            </button>
          </div>

          {/* Equipment */}
          <div className="col-3">
            <SelectField
              label="Equipment"
              name="equipment"
              placeholder="Select Equipment"
              control={control}
              options={equipmentOptions}
              rules={{ required: {
                value: true,
                message: "Please select Equipment"
              }}}
            />
          </div>

          {/* Mode */}
          <div className="col-3">
            <SelectField
              label="Mode"
              name="mode"
              placeholder="Select Mode"
              control={control}
              options={modeOptions}
              rules={{ required: {
                value: true,
                message: "Please select Mode"
              }}}
            />
          </div>

          {/* All-in Rate*/}
          <div className="col-3">
            <CurrencyNumberInput
              label="Carrier All-in Rate"
              id="allInRate"
              name="allInRate"
              placeholder="Enter All-in Rate"
              control={control}
              currency
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>

          {/* Customer Rate */}
          <div className="col-3">
            <CurrencyNumberInput
              label="Customer Rate"
              id="customerRate"
              name="customerRate"
              placeholder="Enter All-in Rate"
              control={control}
              currency
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>

          {/* weight */}
          <div className="col-2">
            <NumberInput
              label="Weight"
              id="weight"
              name="weight"
              placeholder="Weight (Ibs.)"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* length */}
          <div className="col-2">
            <NumberInput
              label="Length"
              id="length"
              name="length"
              placeholder="Length (ft.)"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* width */}
          <div className="col-2">
            <NumberInput
              label="Width"
              id="width"
              name="width"
              placeholder="Width (ft.)"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* height */}
          <div className="col-2">
            <NumberInput
              label="Height"
              id="height"
              name="height"
              placeholder="Height (ft.)"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* Distance */}
          <div className="col-2">
            <NumberInput
              label="Distance"
              id="miles"
              name="miles"
              placeholder="Mile"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* Pieces */}
          <div className="col-2">
            <NumberInput
              label="Pieces"
              id="pieces"
              name="pieces"
              placeholder="Enter Pieces"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* Pallets */}
          <div className="col-3">
            <NumberInput
              label="Pallets"
              id="pallets"
              name="pallets"
              placeholder="Enter Pallets"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          {/* Load Options */}
          <div className="col-3">
            <SelectField
              label="Load Option"
              name="loadOption"
              placeholder="Select Load Option"
              control={control}
              options={loadOptions}
            />
          </div>
          {/* Commodity */}
          <div className="col-3">
            <SelectField
              label="Commodity"
              name="commodity"
              placeholder="Select Commodity"
              control={control}
              options={commodityOptions}
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
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
            />
          </div>
          <div className="col-3">
              <SelectField
                label="Select Customer"
                name="customerId"
                placeholder="Select Customer"
                control={control}
                options={customersList}
              />
          </div>
          {/* Assign User */}
          {user && hasAccess(user.roles, { roles: [UserRole.BROKER_ADMIN]})&& (
            <div className="col-3">
              <SelectField
                label="Assign User"
                name="postedBy"
                placeholder="Select User"
                control={control}
                options={usersList}
              />
            </div>
          )}
          {/* Special Information */}
          <div
            className={`${
              user && hasAccess(user.roles, { roles: [UserRole.BROKER_ADMIN]}) ? "col-9" : "col-12"
            }`}
          >
            <TextAreaBox
              label="Special Information"
              id="specialInstructions"
              name="specialInstructions"
              placeholder="Enter a detailed description"
              control={control}
              rows={3}
            />
          </div>
          <div className="col-12 text-center d-flex justify-content-center gap-3">
            <button
              className="btn btn-accent btn-lg"
              type="submit"
              disabled={!isValid || loading}
              onClick={handleSubmit(submit)}
            >
              {loadId ? "Update" : "Create"}
            </button>
            {origin?.str && destination?.str && (
              <button
                className="btn btn-accent btn-lg"
                type="button"
                onClick={()=> setIsMapModalOpen((prev) => !prev)}
              >
                View Routes
              </button>
            )}
          </div>

          {getValues("origin")?.str && getValues("destination")?.str && (
            <>
              <div className="col-12 mt-5">
                <MapModal
                  isOpen={isMapModalOpen}
                  origin={{
                    lat: getValues("origin").lat,
                    lng: getValues("origin").lng,
                  }}
                  destination={{
                    lat: getValues("destination").lat,
                    lng: getValues("destination").lng,
                  }}
                  onClose={()=> setIsMapModalOpen((prev) => !prev)}
                />
              </div>
            </>
          )}
        </div>
      </form>
    </>
  );
};

export default CreateOrEditLoad;
