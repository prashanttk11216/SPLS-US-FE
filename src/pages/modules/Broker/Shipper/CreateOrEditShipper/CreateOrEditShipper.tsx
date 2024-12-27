import { FC, useEffect, useState } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";
import Stepper, {
  Step,
} from "../../../../../components/common/Stepper/Stepper";
import { Shipper } from "../../../../../types/Shipper";
import {
  createShipper,
  editShipper,
} from "../../../../../services/shipper/shipperService";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import PhoneInputField from "../../../../../components/common/PhoneInputField/PhoneInputField";
import { Address } from "../../../../../types/Address";

export type ShipperForm = {
  firstName: string;
  lastName: string;
  email: string;
  primaryNumber: string;
  address?: {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  };
  addressLine2?: string;
  addressLine3?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  shippingHours?: string;
  isAppointments: boolean;
  isActive: boolean;
  brokerId?: string;
};

interface CreateOrEditShipperProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing Shipper
  shipperData?: Partial<Shipper> | null; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditShipper: FC<CreateOrEditShipperProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  shipperData,
  closeModal,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    reset,
    trigger,
  } = useForm<ShipperForm>({
    mode: "onBlur",
    defaultValues: shipperData || {}, // Pre-fill form when editing
  });

  const {
    createData: newShipper,
    updateData: updateShipper,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createShipper,
    updateDataService: editShipper,
  });

  /**
   * Handles form submission for creating or editing a ShipperUser.
   * @param data - Form data
   */
  const submit = async (data: ShipperForm) => {
    try {
      let result;
      if (isEditing && shipperData?._id) {
        // Update Shipper if editing
        result = await updateShipper(shipperData._id, data);
      } else {
        // Create Shipper User with role assigned
        data.brokerId = user._id;
        result = await newShipper(data);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Shipper User updated successfully."
            : "Shipper User created successfully."
        );
        setIsModalOpen(false);
        resetSteps();
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
    if (isModalOpen) {
      if (isEditing && shipperData) {
        // Pre-fill form when editing
        reset(shipperData);
      } else {
        // Clear form when creating
        reset({
          firstName: "",
          lastName: "",
          primaryNumber: "",
          email: "",
          shippingHours: "",

          // Primary address
          address: {
            str: "", // String representation of the address
            lat: 0,// Latitude
            lng: 0, // Longitude
          },
          addressLine2: "",
          addressLine3: "",
          country: "",
          state: "",
          city: "",
          zip: "",
        });
      }
    }
  }, [isModalOpen, reset, isEditing, shipperData]);

  const nextStep = async () => {
    const stepFields = steps[activeStep].fields || [];
    const isValidStep = await trigger(stepFields);
    if (isValidStep) {
      setCompletedSteps((prev) => [...prev, activeStep]);
      setActiveStep((prev) => prev + 1);
    } else {
      toast.error("Please correct the errors before proceeding.");
    }
  };

  const prevStep = () => {
    // setCompletedSteps((prev) => prev.filter((step) => step !== activeStep - 1)); // Optionally remove completion status for the previous step
    setActiveStep((prev) => Math.max(0, prev - 1)); // Safeguard against going below step 0
  };

  const resetSteps = () => {
    setActiveStep(0);
    setCompletedSteps([]); // Clear all completed steps
  };
  const handlePlaceSelect = (details: Address) => {
    console.log("Selected Place Details:", details);
    setValue("address", {
      str: details.formatted_address!,
      lat: details.lat!,
      lng: details.lng!,
    });
    setValue("country", details.country!);
    setValue("state", details.state!);
    setValue("city", details.city!);
    setValue("zip", details.postal_code!);
  };

  const steps: Step[] = [
    {
      label: "Basic Details",
      content: (
        <>
          <div className="row">
            {/* First Name */}
            <div className="col-12 col-md-6">
              <Input
                label="First Name"
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter First Name"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.firstNameRequired,
                }}
              />
            </div>

            {/* Last Name */}
            <div className="col-12 col-md-6">
              <Input
                label="Last Name"
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter Last Name"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.lastNameRequired,
                }}
              />
            </div>

            {/* Primary Number */}
            <div className="col-12 col-md-6">
              <PhoneInputField
                label={"Primary Number"}
                name={"primaryNumber"}
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.primaryNumberRequired,
                  validate: validatePhoneNumber,
                }}
              />
            </div>

            {/* Email */}
            <div className="col-12 col-md-6">
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.emailRequired,
                  pattern: {
                    value: REGEX_PATTERNS.email,
                    message: VALIDATION_MESSAGES.emailInvalid,
                  },
                }}
              />
            </div>
            {/* Shipping Hours	 */}
            <div className="col-12 col-md-6">
              <Input
                label="Shipping Hours"
                type="text"
                id="shippingHours"
                name="shippingHours"
                placeholder="Enter Shipping Hours"
                control={control}
              />
            </div>
          </div>
        </>
      ),
      fields: ["firstName", "lastName", "primaryNumber"],
    },
    {
      label: "Address",
      content: (
        <>
          {/* Mailing Address Section */}
          <div className="row">
            {/* Address */}
            <div className="col-12 col-md-6">
              <PlaceAutocompleteField
                name="address"
                label="Address"
                control={control}
                placeholder="Enter address"
                rules={{ required: VALIDATION_MESSAGES.addressRequired }} // Example validation
                required
                onPlaceSelect={handlePlaceSelect}
              />
            </div>
            {/* Address Line 2 */}
            <div className="col-12 col-md-6">
              <Input
                label="Address Line 2"
                type="text"
                id="addressLine2"
                name="addressLine2"
                placeholder="Enter Address Line 2"
                control={control}
              />
            </div>
            {/* Address Line 3 */}
            <div className="col-12 col-md-6">
              <Input
                label="Address Line 3"
                type="text"
                id="addressLine3"
                name="addressLine3"
                placeholder="Enter Address Line 3"
                control={control}
              />
            </div>
            {/* Country */}
            <div className="col-12 col-md-6">
              <Input
                label="Country"
                type="text"
                id="country"
                name="country"
                placeholder="Enter Country"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.countryRequired,
                }}
              />
            </div>
            {/* State */}
            <div className="col-12 col-md-6">
              <Input
                label="State"
                type="text"
                id="state"
                name="state"
                placeholder="Enter State"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.stateRequired,
                }}
              />
            </div>
            {/* City */}
            <div className="col-12 col-md-6">
              <Input
                label="City"
                type="text"
                id="city"
                name="city"
                placeholder="Enter City"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.cityRequired,
                }}
              />
            </div>
            {/* Zip */}
            <div className="col-12 col-md-6">
              <Input
                label="Zip"
                type="text"
                id="zip"
                name="zip"
                placeholder="Enter Zip"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.zipRequired,
                }}
              />
            </div>
          </div>
        </>
      ),
      fields: [
        "address", // Primary address (optional for non-customers)
        "country",
        "state",
        "city",
        "zip",
      ],
    },
  ];

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        resetSteps();
        closeModal();
      }}
      title={isEditing ? "Edit Shipper" : "Create Shipper"}
      size="lg"
      isCentered
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

      {/* Form for creating/editing Shipper */}
      <Stepper
        steps={steps}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        completedSteps={completedSteps}
        linear
      />
      <div className="row">
        <div className="col-6 text-start">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={prevStep}
            disabled={activeStep === 0}
          >
            Previous
          </button>
        </div>
        <div className="col-6 text-end">
          {activeStep < steps.length - 1 ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button
              className="btn btn-accent"
              type="submit"
              disabled={!isValid || loading}
              onClick={handleSubmit(submit)}
            >
              {isEditing ? "Update" : "Create"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateOrEditShipper;
