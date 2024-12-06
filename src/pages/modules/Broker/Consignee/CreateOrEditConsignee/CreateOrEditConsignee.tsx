import { FC, useEffect, useState } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import { PhoneInput } from "react-international-phone";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";
import Stepper, { Step } from "../../../../../components/common/Stepper/Stepper";
import { createConsignee, editConsignee } from "../../../../../services/consignee/consigneeService";
import { Consignee } from "../../../../../types/Consignee";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";


export type ConsigneeForm = {
  firstName: string;
  lastName: string;
  email: string;
  primaryNumber: string;
  address?: string;
  addressLine2?: string;
  addressLine3?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  shippingHours?: string;
  isAppointments: boolean;
  isActive: boolean;
  brokerId?: string
} 

interface CreateOrEditConsigneeProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing Consignee
  consigneeData?: Partial<Consignee> | null; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditConsignee: FC<CreateOrEditConsigneeProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  consigneeData,
  closeModal
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
 
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    reset,
    trigger
  } = useForm<ConsigneeForm>({
    mode: "onBlur",
    defaultValues: consigneeData || {}, // Pre-fill form when editing
  });

  const {
    createData: newConsignee,
    updateData: updateConsignee,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createConsignee,
    updateDataService: editConsignee,
  });

  /**
   * Handles form submission for creating or editing a ConsigneeUser.
   * @param data - Form data
   */
  const submit = async (data: ConsigneeForm) => {
    try {
      let result;
      if (isEditing && consigneeData?._id) {
        // Update Consignee if editing
        result = await updateConsignee(consigneeData._id, data);
      } else {
        // Create Consignee User with role assigned
        data.brokerId = user._id;
        result = await newConsignee(data);
      }

      if (result.success) {
        toast.success(
          isEditing ? "Consignee User updated successfully." : "Consignee User created successfully."
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
      if (isEditing && consigneeData) {
        // Pre-fill form when editing
        reset(consigneeData);
      } else {
        // Clear form when creating
        reset({
          firstName: "",
          lastName: "",
          primaryNumber: "",
          email: "",
          shippingHours: "",

          // Primary address
          address: "",
          addressLine2: "",
          addressLine3: "",
          country: "",
          state: "",
          city: "",
          zip: "",
        });
      }
    }
  }, [isModalOpen, reset, isEditing, consigneeData]);

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


  const handlePlaceSelect = (details: {
    formatted_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lng: number | null;
  }) => {
    console.log("Selected Place Details:", details);
    setValue("address", details.formatted_address!);
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
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.firstNameRequired}
                required
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
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.lastNameRequired}
                required
              />
            </div>

            {/* Primary Number */}
            <div className="col-12 col-md-6">
              <label className="form-label text-dark-blue">
                Primary Number{"*"}
              </label>
              <Controller
                name="primaryNumber"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.primaryNumberRequired,
                  validate: validatePhoneNumber,
                }}
                render={({ field }) => (
                  <>
                    <PhoneInput
                      {...field}
                      defaultCountry="us"
                      required
                      className={errors.primaryNumber ? "phone-is-invalid" : ""}
                      inputClassName={`w-100 phone-input form-control ${
                        errors.primaryNumber ? "is-invalid" : ""
                      }`}
                      onChange={(phone) => field.onChange(phone)}
                    />
                    {errors.primaryNumber && (
                      <div className="text-danger">
                        {errors.primaryNumber.message}
                      </div>
                    )}
                  </>
                )}
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
                register={register}
                errors={errors}
                validationMessages={{
                  required: VALIDATION_MESSAGES.emailRequired,
                  pattern: VALIDATION_MESSAGES.emailInvalid,
                }}
                pattern={REGEX_PATTERNS.email}
                required
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
                register={register}
                errors={errors}
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
                register={register}
                errors={errors}
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
                register={register}
                errors={errors}
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
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.countryRequired}
                required
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
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.stateRequired}
                required
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
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.cityRequired}
                required
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
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.zipRequired}
                required
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
      ]
    }
  ]

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        resetSteps();
        closeModal();
      }}      
      title={isEditing ? "Edit Consignee" : "Create Consignee"}
      size="lg"
      isCentered
      backdropClose
    >
      {/* Show loader during API calls */}
      {loading && <Loading />}

      {/* Display error message if API fails */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error: </strong>{error}
        </div>
      )}

        {/* Form for creating/editing Consignee */}
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

export default CreateOrEditConsignee;
