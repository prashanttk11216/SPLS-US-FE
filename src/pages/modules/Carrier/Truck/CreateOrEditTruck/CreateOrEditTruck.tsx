import { FC, useEffect } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { Truck } from "../../../../../types/Truck";
import {
  createTruck,
  editTruck,
} from "../../../../../services/truck/truckService";
import { Equipment } from "../../../../../enums/Equipment";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import Input from "../../../../../components/common/Input/Input";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import { filterObjectKeys } from "../../../../../utils/globalHelper";

export type truckForm = {
  origin: {
    str: string;
    lat: number;
    lng: number;
  };
  availableDate: Date;
  destination?: {
    str: string;
    lat: number;
    lng: number;
  };
  equipment: Equipment;
  allInRate?: number;
  weight?: number;
  length?: number;
  miles?: number;
  comments?: string;
  referenceNumber?: number;
};

interface CreateOrEditTruckProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing Truck
  truckData?: Partial<Truck> | null; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditTruck: FC<CreateOrEditTruckProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  truckData,
  closeModal,
}) => {
  const equipmentOptions = Object.entries(Equipment).map(([_, value]) => ({
    value: value,
    label: value,
  }));

  const {
    handleSubmit,
    control,
    formState: { isValid },
    setValue,
    reset,
  } = useForm<truckForm>({
    mode: "onBlur",
  });

  const {
    createData: newTruck,
    updateData: updateTruck,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createTruck,
    updateDataService: editTruck,
  });

  const submit = async (data: truckForm) => {
    try {
      let result;
      if (isEditing && truckData?._id) {
        result = await updateTruck(truckData._id, data);
      } else {
        result = await newTruck(data);
      }

      if (result.success) {
        toast.success(result.message);
        setIsModalOpen(false);
      } else {
        throw new Error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Reset form state or pre-fill values when modal opens/closes
  useEffect(() => {
    if (isEditing && truckData) {
      // Pre-fill form when editing
      const filteredData = filterObjectKeys(truckData, [
        "origin",
        "availableDate",
        "destination",
        "equipment",
        "allInRate",
        "weight",
        "length",
        "miles",
        "comments",
        "referenceNumber",
      ]);
      reset(filteredData);
    } else {
      // Clear form when creating
      reset({
        origin: undefined,
        availableDate: undefined,
        destination: undefined,
        equipment: undefined,
        allInRate: undefined,
        weight: undefined,
        length: undefined,
        miles: undefined,
        comments: undefined,
        referenceNumber: undefined,
      });
    }
  }, [isModalOpen]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        closeModal();
      }}
      title={isEditing ? "Edit Truck" : "Create Truck"}
      size="lg"
      isCentered
      backdropClose
    >
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
          {/* Origin */}
          <div className="col-6">
            <PlaceAutocompleteField
              name="origin"
              label="Origin City & State, or Zip Code"
              control={control}
              placeholder="Enter Origin City & State, or Zip Code"
              rules={{ required: VALIDATION_MESSAGES.originRequired }} // Example validation
              onPlaceSelect={(details) => {
                setValue("origin", {
                  str: details.formatted_address!,
                  lat: details.lat!,
                  lng: details.lng!,
                });
              }}
              required
            />
          </div>
          {/* Destination */}
          <div className="col-6">
            <PlaceAutocompleteField
              name="destination"
              label="Destination City & State, or Zip Code"
              control={control}
              placeholder="Enter Destination City & State, or Zip Code"
              onPlaceSelect={(details) => {
                setValue("destination", {
                  str: details.formatted_address!,
                  lat: details.lat!,
                  lng: details.lng!,
                });
              }}
            />
          </div>
          {/* Origin Early Pickup Date*/}
          <div className="col-4">
            <DateInput
              name="availableDate"
              control={control}
              label="Available Date(s)"
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
          {/* Equipment */}
          <div className="col-4">
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
          {/* weight */}
          <div className="col-4">
            <NumberInput
              label="Weight"
              id="weight"
              min={0}
              name="weight"
              placeholder="Weight(Ibs.)"
              control={control}
              preventNegative
            />
          </div>
          {/* length */}
          <div className="col-4">
            <NumberInput
              label="Length"
              id="length"
              min={0}
              name="length"
              placeholder="Length(ft.)"
              control={control}
              preventNegative
            />
          </div>
          {/* All-in Rate*/}
          <div className="col-4">
            <NumberInput
              label="All-in Rate"
              id="allInRate"
              min={0}
              name="allInRate"
              placeholder="Enter All-in Rate"
              control={control}
              currency
              preventNegative
            />
          </div>

          {/* Load/Reference Number */}
          <div className="col-4">
            <NumberInput
              label="Reference Number"
              id="referenceNumber"
              min={0}
              name="referenceNumber"
              disabled={isEditing ? true : false}
              placeholder="Enter Reference Number"
              control={control}
              preventNegative
            />
          </div>

          {/* Comments */}
          <div className="col-12">
            <Input
              label="Comments"
              id="comments"
              name="comments"
              placeholder="Comments"
              control={control}
              isTextArea
              rows={3}
            />
          </div>

          <div className="col-12 text-end mt-3">
            <button
              className="btn btn-secondary me-3"
              type="submit"
              onClick={() => closeModal()}
            >
              Close
            </button>
            <button
              className="btn btn-accent"
              type="submit"
              disabled={!isValid || loading}
              onClick={handleSubmit(submit)}
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrEditTruck;
