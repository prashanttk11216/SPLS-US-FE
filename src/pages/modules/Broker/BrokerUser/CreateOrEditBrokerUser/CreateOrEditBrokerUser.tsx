import { FC, useEffect, useState } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { CreateUserForm } from "../../../../Auth/Signup/Signup";
import { useForm } from "react-hook-form";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import {
  createBroker,
  editUser,
} from "../../../../../services/user/userService";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";
import Stepper, {
  Step,
} from "../../../../../components/common/Stepper/Stepper";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import { Address } from "../../../../../types/Address";
import PasswordInput from "../../../../../components/common/PasswordInput/PasswordInput";
import PhoneNumberInput from "../../../../../components/common/PhoneNumberInput/PhoneNumberInput";

interface CreateOrEditBrokerUserProps {
  isModalOpen: boolean; // Controls modal visibility
  isEditing: boolean; // Indicates if editing an existing BrokerUser
  brokerUserData?: Partial<CreateUserForm> | null; // Pre-filled data for editing
  closeModal: (refresh?: boolean) => void;
}

const CreateOrEditBrokerUser: FC<CreateOrEditBrokerUserProps> = ({
  isModalOpen,
  isEditing,
  brokerUserData,
  closeModal,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const roles = useSelector((state: RootState) => state.roles);
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    handleSubmit,
    control,
    formState: { isValid },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<CreateUserForm>({
    mode: "onBlur",
  });


  const { createData, updateData, loading } = useFetchData<any>({
    create: { 
      user: createBroker,
     },
     update: {
      user: editUser,
     },
  });

  /**
   * Handles form submission for creating or editing a BrokerUser.
   * @param data - Form data
   */
  const submit = async (data: CreateUserForm) => {
    let result;
    if (isEditing && brokerUserData?._id) {
      // Update Broker if editing
      result = await updateData("user", brokerUserData._id, data);
    } else {
      // Create Broker User with role assigned
      data.roles = roles.filter((role)=> role.name === UserRole.BROKER_USER).map((role)=>role._id);
      if(typeof user.brokerId === "string") data.brokerId = user.brokerId;
        data.postedBy = user._id;
      result = await createData("user",data);
    }
    if (result.success) {
      toast.success(
        isEditing
          ? "Broker User updated successfully."
          : "Broker User created successfully."
      );
      closeModal(true);
    }
  };

  // Reset form state or pre-fill values when modal opens/closes
  useEffect(() => {
    if (isModalOpen && isEditing && brokerUserData) {
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
        company: "",
        password: "",
        confirmPassword: "",

        // Primary address
        address: {
          str: "",
          lat: 0,
          lng: 0,
        },
        addressLine2: "",
        addressLine3: "",
        country: "",
        state: "",
        city: "",
        zip: "",
      });
    }
  }, [isModalOpen, isEditing, brokerUserData]);

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

  const handlePlaceSelect = (details: Address) => {
    setValue("country", details.country!);
    setValue("state", details.state!);
    setValue("city", details.city!);
    setValue("zip", details.postal_code!);
  };

  /**
   * Validates if the confirmed password matches the entered password.
   * @param value - Confirm password value
   */
  const validatePassword = (value: string) => {
    return watch("password") === value || "Passwords do not match";
  };

  const steps: Step[] = [
    {
      label: "Basic Details",
      content: (
        <>
          <div className="row">
            {/* Employee ID */}
            <div className="col-12 col-md-6">
              <Input
                label="Employee Id"
                type="text"
                id="employeeId"
                name="employeeId"
                placeholder="Enter Employee Id"
                control={control}
                rules={{
                  required: VALIDATION_MESSAGES.employeeIdRequired,
                }}
              />
            </div>
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
              <PhoneNumberInput
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
                isOnlyLowerCase={true}
                rules={{
                  required: VALIDATION_MESSAGES.emailRequired,
                  pattern: {
                    value: REGEX_PATTERNS.email,
                    message: VALIDATION_MESSAGES.emailInvalid,
                  },
                }}
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
                control={control}
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
                onPlaceSelect={handlePlaceSelect}
                setValue={setValue}
                rules={{ 
                  required: VALIDATION_MESSAGES.addressRequired,
                  validate: (value: any) => (value?.str ? true : VALIDATION_MESSAGES.addressRequired)
                }}
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

  if (!isEditing) {
    steps.push({
      label: "Security",
      content: (
        <>
          <div className="row">
            {/* Password (only for creating) */}
            <>
              <div className="col-12 col-md-6">
                <PasswordInput
                  label="Password"
                  id="password"
                  name="password"
                  placeholder="Enter Password"
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.passwordRequired,
                    pattern: {
                      value: REGEX_PATTERNS.password,
                      message: VALIDATION_MESSAGES.passwordPattern,
                    },
                  }}
                />
              </div>

              <div className="col-12 col-md-6">
                <PasswordInput
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.confirmPasswordRequired,
                    validate: validatePassword,
                  }}
                />
              </div>
            </>
          </div>
        </>
      ),
      fields: ["password", "confirmPassword"],
    });
  }

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Broker User" : "Create Broker User"}
      size="lg"
      isCentered
    >
      {/* Show loader during API calls */}
      {loading && <Loading />}

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
