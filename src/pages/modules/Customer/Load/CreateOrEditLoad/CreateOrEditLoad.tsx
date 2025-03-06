import { FC, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import {
  createLoad,
  editLoad,
  getLoadById,
} from "../../../../../services/load/loadServices";
import { useNavigate, useParams } from "react-router-dom";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import { createLoadSchema, updateLoadSchema } from "../../../../../schema/Load";
import calculateDistance, {
  formatDistance,
} from "../../../../../utils/distanceCalculator";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import MapModal from "../../../../../components/common/MapModal/MapModal";
import { commodityOptions, equipmentOptions, loadOptions, modeOptions } from "../../../../../utils/dropdownOptions";
import CurrencyNumberInput from "../../../../../components/common/CurrencyNumberInput/CurrencyNumberInput";
import TextAreaBox from "../../../../../components/common/TextAreaBox/TextAreaBox";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import { LoadForm } from "../../../Broker/Load/CreateOrEditLoad/CreateOrEditLoad";
import { dateTimeOptions, validateLocation } from "../../../../../utils/globalHelper";

interface CreateOrEditLoadProps {}

const CreateOrEditLoad: FC<CreateOrEditLoadProps> = ({}) => {
  const user = useSelector((state: RootState) => state.user);

  const navigate = useNavigate();
  const { loadId } = useParams();
  const [loadData, setLoadData] = useState<LoadForm>();

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const toggleMapModal = () => setIsMapModalOpen((prev) => !prev);

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


  const { createData, updateData, getDataById, loading, error } = useFetchData<any>({
    create: { 
      load: createLoad,
     },
     update: {
      load: editLoad
     },
     getById: {
      load: getLoadById
     }
  });

  const fetchLoad = async (loadId: string) => {
    const query = `?populate=brokerId:-password,postedBy:-password`;
    const result = await getDataById("load", loadId, query);
    if (result.success) {
      setLoadData(result.data);
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
      if (loadId && loadData?._id) {
        const validatedData = updateLoadSchema.parse(data);
        result = await updateData("load", loadData._id, validatedData);
      } else {
        data.customerId = user._id;
        if(typeof user.brokerId === "string") data.postedBy = data.brokerId = user.brokerId;
        const validatedData = createLoadSchema.parse(data);
        result = await createData("load", validatedData);
      }

      if (result.success) {
        toast.success(
          loadId ? "Load updated successfully." : "Load created successfully."
        );
        navigate("/customer");
      } else {
        throw new Error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const getDistance = async () => {
    const origin = getValues("origin");
    const destination = getValues("destination");
  
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      console.error("Origin or destination is missing required coordinates.");
      return 0; // Return a default value if data is missing
    }
  
    const originData = {
      lat: origin.lat,
      lng: origin.lng,
    };
  
    const destinationData = {
      lat: destination.lat,
      lng: destination.lng,
    };
  
    try {
      const distance = await calculateDistance(originData, destinationData);
      return distance;
    } catch (error) {
      console.error("Error calculating distance:", error);
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
            <h4 className="fw-bolder">Origin</h4>
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
                validate: validateLocation,
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
                dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
              datePickerProps={dateTimeOptions}
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
                dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
              datePickerProps={dateTimeOptions}
            />
          </div>

          {originFields.map((item, index) => (
            <>
              <div
                key={item.id}
                className="col-12 mb-2 border-top border-bottom border-secondary border-2"
              >
                <div className="row py-2">
                  {/* delete */}
                  <div className="col-12 d-flex align-items-center justify-content-between mb-2">
                    <h5 className="fw-lighter">Stop {index + 1}</h5>
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
                        validate: validateLocation,
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
                        dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
                      datePickerProps={dateTimeOptions}
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
                        dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
                      datePickerProps={dateTimeOptions}
                    />
                  </div>
                </div>
              </div>
            </>
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
            <h4 className="fw-bolder">Destination</h4>
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
                validate: validateLocation,
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
                dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
              datePickerProps={dateTimeOptions}
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
                dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
              datePickerProps={dateTimeOptions}
            />
          </div>

          {destinationFields.map((item, index) => (
            <>
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
                        validate: validateLocation,
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
                        dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
                      datePickerProps={dateTimeOptions}
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
                        dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
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
                      datePickerProps={dateTimeOptions}
                    />
                  </div>
                </div>
              </div>
            </>
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
          <div className="col-2">
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
          <div className="col-2">
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

          {/* Customer Rate */}
          <div className="col-2">
            <CurrencyNumberInput
              label="All-in Rate"
              id="customerRate"
              name="customerRate"
              placeholder="Enter All-in Rate"
              control={control}
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
              currency
            />
          </div>

          {/* weight */}
          <div className="col-2">
            <NumberInput
              label="Weight"
              id="weight"
              name="weight"
              placeholder="Weight (Ibs.)"
              rules={{min: {value: 0, message: VALIDATION_MESSAGES.nonNegative}}}
              control={control}
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
          <div className="col-2">
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
          <div className="col-2">
            <SelectField
              label="Load Option"
              name="loadOption"
              placeholder="Select Load Option"
              control={control}
              options={loadOptions}
            />
          </div>
          {/* Commodity */}
          <div className="col-2">
            <SelectField
              label="Commodity"
              name="commodity"
              placeholder="Select Commodity"
              control={control}
              options={commodityOptions}
            />
          </div>
          {/* Special Information */}
          <div className="col-12">
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
                onClick={toggleMapModal}
              >
                View Routes
              </button>
            )}
          </div>
          {getValues("origin")?.str && getValues("destination")?.str && (
            <div className="col-12 my-5">
              <MapModal
                isOpen={isMapModalOpen}
                origin={{
                  lat: getValues("origin")?.lat ?? 0,  // Provide a fallback value (0 or any valid default)
                  lng: getValues("origin")?.lng ?? 0,
                }}
                destination={{
                  lat: getValues("destination")?.lat ?? 0,
                  lng: getValues("destination")?.lng ?? 0,
                }}
                onClose={toggleMapModal}
              />
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default CreateOrEditLoad;
