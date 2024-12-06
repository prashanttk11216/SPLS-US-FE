import { FC, useEffect, useState } from "react";
import { User } from "../../../../../types/User";
import { createUserForm } from "../../../../Auth/Signup/Signup";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { createUser, editUser } from "../../../../../services/user/userService";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import Modal from "../../../../../components/common/Modal/Modal";
import Loading from "../../../../../components/common/Loading/Loading";
import Input from "../../../../../components/common/Input/Input";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { PhoneInput } from "react-international-phone";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";
import Stepper, { Step } from "../../../../../components/common/Stepper/Stepper";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";

interface CreateOrEditCarrierProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing customer
  carrierData?: Partial<User> | null; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditCarrier: FC<CreateOrEditCarrierProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  carrierData,
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
    watch,
    reset,
    getValues,
    setValue,
    trigger
  } = useForm<createUserForm>({
    mode: "onBlur",
    defaultValues: carrierData || {}, // Pre-fill form when editing
  });
  const {
    createData: createCarrier,
    updateData: updateCarrier,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createUser,
    updateDataService: editUser,
  });

  /**
   * Handles form submission for creating or editing a carrier.
   * @param data - Form data
   */

  const submit = async (data: createUserForm) => {
    try {
      let result;
      if (isEditing && carrierData?._id) {
        // Update carrier if editing
        result = await updateCarrier(carrierData._id, data);
      } else {
        // Create carrier with role assigned
        data.role = UserRole.CARRIER;
        data.brokerId = user._id;
        result = await createCarrier(data);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Carrirer updated successfully."
            : "Carrirer created successfully."
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

  /**
   * Validates if the confirmed password matches the entered password.
   * @param value - Confirm password value
   */
  const validatePassword = (value: string) => {
    return watch("password") === value || "Passwords do not match";
  };

  // Reset form state or pre-fill values when modal opens/closes
  useEffect(() => {
    if (isModalOpen && isEditing && carrierData) {
      // Pre-fill form when editing
      reset(carrierData);
    } else {
      // Clear form when creating
      reset({
        firstName: "",
        lastName: "",
        primaryNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        company: "",

        // Primary address
        address: "",
        addressLine2: "",
        addressLine3: "",
        country: "",
        state: "",
        city: "",
        zip: "",

        sameAsMailing: false,

        // Billing-specific fields (only for customers)
        billingAddress: "",
        billingAddressLine2: "",
        billingAddressLine3: "",
        billingCountry: "",
        billingState: "",
        billingCity: "",
        billingZip: "",
      });
    }
  }, [isModalOpen, isEditing, carrierData]);

  const handleSameAsMailingChange = async (e: any) => {
    if(e.target.checked) {
      const values = getValues();
      setValue("billingAddress", values.address);
      setValue("billingAddressLine2", values.addressLine2);
      setValue("billingAddressLine3", values.addressLine3);
      setValue("billingCountry", values.country);
      setValue("billingState", values.state);
      setValue("billingCity", values.city);
      setValue("billingZip", values.zip);
      await trigger(['billingAddress','billingCountry','billingState','billingCity','billingZip']);
    }else {
      // Clear billing address fields if unchecked
      setValue("billingAddress", "");
      setValue("billingAddressLine2", "");
      setValue("billingAddressLine3", "");
      setValue("billingCountry", "");
      setValue("billingState", "");
      setValue("billingCity", "");
      setValue("billingZip", "");
    }
  };

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
                disabled={isEditing} // Disable email during editing
              />
            </div>

            {/* Company Name */}
            <div className="col-12 col-md-6">
              <Input
                label="Company Name"
                type="text"
                id="company"
                name="company"
                placeholder="Enter Company Name"
                register={register}
                errors={errors}
              />
            </div>
          </div>
        </>
      ),
      fields: ["firstName", "lastName", "primaryNumber", "email"],
    },
    {
      label: "Mailing Address",
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
                onPlaceSelect={(details)=>handlePlaceSelect(details)}
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
    },
    {
      label: "Billing Address",
      content: (
        <>
          {/* Billing Address Section */}
          <div className="d-flex align-items-center mb-3">
            <CheckboxField
              label="Same as Mailing Address"
              id="sameAsMailing"
              name="sameAsMailing"
              onChange={handleSameAsMailingChange}
              register={register}
              errors={errors}
            />
          </div>
          <div className="row">
            {/* Billing Address */}
            <div className="col-12 col-md-6">
            <PlaceAutocompleteField
                name="billingAddress"
                label="Billing Address"
                control={control}
                placeholder="Enter Primary Billing Address"
                rules={{ required: VALIDATION_MESSAGES.addressRequired }} // Example validation
                required
                onPlaceSelect={(details)=>handlePlaceSelect(details, true)}
              />
            </div>
            {/* Billing Address Line 2 */}
            <div className="col-12 col-md-6">
              <Input
                label="Billing Address Line 2"
                type="text"
                id="billingAddressLine2"
                name="billingAddressLine2"
                placeholder="Enter Additional Address Info"
                register={register}
                errors={errors}
              />
            </div>
            {/* Billing Address Line 3 */}
            <div className="col-12 col-md-6">
              <Input
                label="Billing Address Line 3"
                type="text"
                id="billingAddressLine3"
                name="billingAddressLine3"
                placeholder="Enter Additional Address Info"
                register={register}
                errors={errors}
              />
            </div>
            {/* Country */}
            <div className="col-12 col-md-6">
              <Input
                label="Country"
                type="text"
                id="billingCountry"
                name="billingCountry"
                placeholder="Enter Country Name"
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
                id="billingState"
                name="billingState"
                placeholder="Enter State Name"
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
                id="billingCity"
                name="billingCity"
                placeholder="Enter City Name"
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.cityRequired}
                required
              />
            </div>
            {/* Zip Code */}
            <div className="col-12 col-md-6">
              <Input
                label="Zip Code"
                type="text"
                id="billingZip"
                name="billingZip"
                placeholder="Enter Zip Code"
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
        // Billing-specific fields (only for customers)
        "billingAddress",
        "billingCountry",
        "billingState",
        "billingCity",
        "billingZip",
      ],
    },
    {
      label: "Security",
      content: (
        <>
          <div className="row">
            {/* Password (only for creating) */}
            <>
              <div className="col-12 col-md-6">
                <Input
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter Password"
                  register={register}
                  errors={errors}
                  validationMessages={{
                    required: VALIDATION_MESSAGES.passwordRequired,
                    pattern: VALIDATION_MESSAGES.passwordPattern,
                  }}
                  pattern={REGEX_PATTERNS.password}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  register={register}
                  errors={errors}
                  validationMessages={{
                    required: VALIDATION_MESSAGES.confirmPasswordRequired,
                  }}
                  validateFun={validatePassword}
                  required
                />
              </div>
            </>
          </div>
        </>
      ),
      fields: ["password", "confirmPassword"],
    },
  ]

  const handlePlaceSelect = (details: {
    formatted_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lng: number | null;
  }, isBilling: boolean = false) => {
    console.log("Selected Place Details:", details);
    if(isBilling){
      setValue("billingAddress", details.formatted_address!);
      setValue("billingCountry", details.country!);
      setValue("billingState", details.state!);
      setValue("billingCity", details.city!);
      setValue("billingZip", details.postal_code!);
    }else{
    setValue("address", details.formatted_address!);
    setValue("country", details.country!);
    setValue("state", details.state!);
    setValue("city", details.city!);
    setValue("zip", details.postal_code!);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        resetSteps();
        closeModal();
      }}       
      title={isEditing ? "Edit Carrier" : "Create Carrier"}
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

      {/* Form for creating/editing Broker User */}
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

export default CreateOrEditCarrier;
