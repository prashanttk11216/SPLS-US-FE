import { FC, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { Equipment } from "../../../../../enums/Equipment";
import { LoadOption } from "../../../../../enums/LoadOption";
import { Commodity } from "../../../../../enums/Commodity";
import { Mode } from "../../../../../enums/Mode";
import {
  createLoad,
  editLoad,
  getLoadById,
} from "../../../../../services/load/loadServices";
import { useNavigate, useParams } from "react-router-dom";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import { UserRole } from "../../../../../enums/UserRole";
import { getUsers } from "../../../../../services/user/userService";
import { createLoadSchema, updateLoadSchema } from "../../../../../schema/Load";

export type loadForm = {
  _id: string;
  origin: string;
  originEarlyPickupDate: Date;
  originLatePickupDate?: Date | string;
  originEarlyPickupTime?: Date | string;
  originLatePickupTime?: Date | string;
  originStops?: {
    address: string;
    earlyPickupDate?: Date | string;
    latePickupDate?: Date | string;
    earlyPickupTime?: Date | string;
    latePickupTime?: Date | string;
  }[];
  destination: string;
  destinationEarlyDropoffDate?: Date | string;
  destinationLateDropoffDate?: Date | string;
  destinationEarlyDropoffTime?: Date | string;
  destinationLateDropoffTime?: Date | string;
  destinationStops?: {
    address: string;
    earlyDropoffDate?: Date | string;
    lateDropoffDate?: Date | string;
    earlyDropoffTime?: Date | string;
    lateDropoffTime?: Date | string;
  }[];
  equipment: Equipment;
  mode: Mode;
  allInRate?: number;
  customerRate?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  distance?: number;
  pieces?: number;
  pallets?: number;
  loadOption?: LoadOption;
  specialInstructions?: string;
  commodity: Commodity;
  loadNumber?: string;
  postedBy?: string;
  status?: string;
};

interface CreateOrEditLoadProps {}

const CreateOrEditLoad: FC<CreateOrEditLoadProps> = ({}) => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const { loadId } = useParams();
  const [loadData, setLoadData] = useState<loadForm>();
  const [usersList, setUsersList] = useState<any[]>([]);

  const equipmentOptions = Object.entries(Equipment).map(([key, value]) => ({
    value: value,
    label: value,
  }));
  const modeOptions = Object.entries(Mode).map(([key, value]) => ({
    value: value,
    label: value,
  }));

  const loadOptions = Object.entries(LoadOption).map(([key, value]) => ({
    value: value,
    label: value,
  }));

  const commodityOptions = Object.entries(Commodity).map(([key, value]) => ({
    value: value,
    label: value,
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm<loadForm>({
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
    fetchByIdService: getLoadById
  });

  const {
    fetchData: fetchUsers,
  } = useFetchData<any>({
    fetchDataService: getUsers
  });

  const fetchLoad =  async (loadId: string) => {
        const result = await fetchLoadById(loadId);
        if(result.success) {          
          setLoadData(result.data);
        }
  }


  const fetchUsersData =  async () => {
    let query = `?role=${UserRole.BROKER_USER}`
    const result = await fetchUsers(query);
    if(result.success) {
      let users: any = [];
      result?.data?.forEach(user => {
        users.push({
          value: user._id,
          label: `${user.firstName} ${user.lastName}`,
        })
      });        
      setUsersList(users)
    }
  }

  useEffect(() => {
    if(loadId) fetchLoad(loadId);
  }, [loadId]);
  useEffect(()=>{
    if(loadData){
      reset(loadData);
    }
  },[loadData])

  useEffect(()=>{
    fetchUsersData();
  },[]);

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
      address: "",
      earlyPickupDate: "",
      latePickupDate: "",
      earlyPickupTime: "",
      latePickupTime: "",
    });
  };

  const addDestinationStop = () => {
    appendDestination({
      address: "",
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
  const submit = async (data: loadForm) => {
    try {
      let result;
      if (loadId && loadData) {
        const validatedData = updateLoadSchema.parse(data);
        result = await updateLoad(loadData._id, validatedData);
      } else {
        const validatedData = createLoadSchema.parse(data);
        result = await newLoad(validatedData);
      }

      if (result.success) {
        toast.success(
          loadId ? "Load updated successfully." : "Load created successfully."
        );
        navigate("/customer")
      } else {
        throw new Error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

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
            <Input
              label="Origin City & State, or Zip Code"
              type="text"
              id="origin"
              name="origin"
              placeholder="Enter Origin City & State, or Zip Code"
              register={register}
              errors={errors}
              errorMessage={VALIDATION_MESSAGES.originRequired}
              required
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
            <>
              <div key={item.id} className="col-12 mb-2 border-top border-bottom border-secondary border-2">
                <div className="row py-2">
                  {/* delete */}
                  <div className="col-12 d-flex align-items-center justify-content-between mb-2">
                    <h4 className="fw-lighter">Stop {index}</h4>
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
                    <Input
                      label={`Stop ${index} City & State, or Zip Code`}
                      type="text"
                      id={`${item.id}-${item.address}`}
                      name={`originStops.${index}.address`}
                      placeholder={`Enter Stop ${index} City & State, or Zip Code`}
                      register={register}
                      errors={errors}
                      required
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
            <h3 className="fw-lighter">Destination</h3>
          </div>

          {/* Destination */}
          <div className="col-4">
            <Input
              label="Destination City & State, or Zip Code"
              type="text"
              id="destination"
              name="destination"
              placeholder="Enter Destination City & State, or Zip Code"
              register={register}
              errors={errors}
              errorMessage={VALIDATION_MESSAGES.destinationRequired}
              required
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
            <>
              <div key={item.id} className="col-12 mb-2 border-top border-bottom border-secondary border-2">
                <div className="row py-2">
                  {/* delete */}
                  <div className="col-12 d-flex align-items-center justify-content-between mb-2">
                    <h4 className="fw-lighter">Stop {index}</h4>
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
                    <Input
                      label={`Stop ${index} City & State, or Zip Code`}
                      type="text"
                      id={`${item.id}-${item.address}`}
                      name={`destinationStops.${index}.address`}
                      placeholder={`Enter Stop ${index} City & State, or Zip Code`}                  
                      register={register}
                      errors={errors}
                      required
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
              rules={{ required: "Please select Equipment" }} // Example validation
              required
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
              rules={{ required: "Please select Mode" }} // Example validation
              required
            />
          </div>

          {/* Customer Rate */}
          <div className="col-2">
            <NumberInput
              label="All-in Rate"
              id="customerRate"
              min={0}
              name="customerRate"
              placeholder="Enter All-in Rate"
                            control={control}

              errors={errors} 
              currency
              preventNegative
            />
          </div>

          {/* weight */}
          <div className="col-2">
            <NumberInput
              label="Weight"
              id="weight"
              min={0}
              name="weight"
              placeholder="Weight"
              control={control}
              errors={errors} 
              preventNegative
            />
          </div>
          {/* length */}
          <div className="col-2">
            <NumberInput
              label="Length"
              id="length"
              min={0}
              name="length"
              placeholder="Feet"
                            control={control}

              errors={errors} 
              preventNegative
            />
          </div>
          {/* width */}
          <div className="col-2">
            <NumberInput
              label="Width"
              id="width"
              min={0}
              name="width"
              placeholder="Feet"
                            control={control}

              errors={errors} 
              preventNegative
            />
          </div>
          {/* height */}
          <div className="col-2">
            <NumberInput
              label="Height"
              id="height"
              min={0}
              name="height"
              placeholder="Feet"
                            control={control}

              errors={errors} 
              preventNegative
            />
          </div>
          {/* Distance */}
          <div className="col-2">
            <NumberInput
              label="Distance"
              id="distance"
              min={0}
              name="distance"
              placeholder="Mile"
                            control={control}

              errors={errors} 
              preventNegative
            />
          </div>
          {/* Pieces */}
          <div className="col-2">
            <NumberInput
              label="Pieces"
              id="pieces"
              min={0}
              name="pieces"
              placeholder="Enter Pieces"
                            control={control}

              errors={errors} 
              preventNegative
            />
          </div>
          {/* Pallets */}
          <div className="col-2">
            <NumberInput
              label="Pallets"
              id="pallets"
              min={0}
              name="pallets"
              placeholder="Enter Pallets"
                            control={control}

              errors={errors} 
              preventNegative
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
            <Input
                label="Special Information"
                id="specialInstructions"
                name="specialInstructions"
                placeholder="Enter a detailed description"
                register={register}
                errors={errors}
                isTextArea
                rows={3}
              />
          </div>
          <div className="col-12 text-center">
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

export default CreateOrEditLoad;
