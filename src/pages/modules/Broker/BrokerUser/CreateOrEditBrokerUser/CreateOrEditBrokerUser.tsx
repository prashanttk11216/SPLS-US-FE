import { FC, useEffect, useState } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { createUserForm } from "../../../../Auth/Signup/Signup";
import { Controller, useForm } from "react-hook-form";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import { createBroker, editUser } from "../../../../../services/user/userService";
import { User } from "../../../../../types/User";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import { PhoneInput } from "react-international-phone";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";
import Stepper, { Step } from "../../../../../components/common/Stepper/Stepper";

interface CreateOrEditBrokerUserProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing BrokerUser
  brokerUserData?: Partial<User> | null; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditBrokerUser: FC<CreateOrEditBrokerUserProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  brokerUserData,
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
    trigger
  } = useForm<createUserForm>({
    mode: "onBlur",
    defaultValues: brokerUserData || {}, // Pre-fill form when editing
  });

  const {
    createData: createBrokerUser,
    updateData: updateBrokerUser,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createBroker,
    updateDataService: editUser,
  });

  /**
   * Handles form submission for creating or editing a BrokerUser.
   * @param data - Form data
   */
  const submit = async (data: createUserForm) => {
    try {
      let result;
      if (isEditing && brokerUserData?._id) {
        // Update Broker if editing
        result = await updateBrokerUser(brokerUserData._id, data);
      } else {
        // Create Broker User with role assigned
        data.role = UserRole.BROKER_USER;
        data.brokerId = user._id;
        result = await createBrokerUser(data);
      }

      if (result.success) {
        toast.success(
          isEditing ? "Broker User updated successfully." : "Broker User created successfully."
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
    if (isModalOpen) {
      if (isEditing && brokerUserData) {
        // Pre-fill form when editing
        reset(brokerUserData);
      } else {
        // Clear form when creating
        reset({
          employeeId: "",
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
        });
      }
    }
  }, [isModalOpen, reset, isEditing, brokerUserData]);

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
              <Input
                label="Address"
                type="text"
                id="address"
                name="address"
                placeholder="Enter Address"
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.addressRequired}
                required
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

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        resetSteps();
        closeModal();
      }}      
      title={isEditing ? "Edit Broker User" : "Create Broker User"}
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

export default CreateOrEditBrokerUser;
