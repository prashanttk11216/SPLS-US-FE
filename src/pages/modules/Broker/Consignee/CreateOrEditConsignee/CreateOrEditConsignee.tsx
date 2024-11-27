import { FC, useEffect, useState } from "react";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import { createUserForm } from "../../../../Auth/Signup/Signup";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { Controller, useForm } from "react-hook-form";
import Input from "../../../../../components/common/Input/Input";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { PhoneInput } from "react-international-phone";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";
import Stepper, {
  Step,
} from "../../../../../components/common/Stepper/Stepper";
import Modal from "../../../../../components/common/Modal/Modal";
import Loading from "../../../../../components/common/Loading/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import {
  createConsignee,
  editConsignee,
} from "../../../../../services/consignee/consigneeService";
import { Consignee } from "../../../../../types/Consignee";

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
  closeModal,
}) => {
  const user = useSelector((state: RootState) => state.consignee);
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm<createUserForm>({
    mode: "onBlur",
    defaultValues: consigneeData || {}, // Pre-fill form when editing
  });

  const {
    createData: createdConsignee,
    updateData: updateConsignee,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createConsignee,
    updateDataService: editConsignee,
  });

  const submit = async (data: createUserForm) => {
    try {
      let result;
      if (isEditing && consigneeData?._id) {
        // Update Consignee if editing
        result = await updateConsignee(consigneeData._id, data);
      } else {
        // Create Consignee with role assigned
        data.role = UserRole.CONSIGNEE;
        data.brokerId = user._id;
        result = await createdConsignee(data);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Consignee updated successfully."
            : "Consignee created successfully."
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

          // Primary address
          address: "",
          addressLine2: "",
          addressLine3: "",
          country: "",
          state: "",
          city: "",
          zip: "",

          // Billing-specific fields (only for Consignees)
          billingAddress: "",
          billingAddressLine2: "",
          billingAddressLine3: "",
          billingCountry: "",
          billingState: "",
          billingCity: "",
          billingZip: "",
        });
      }
    }
  }, [isModalOpen, reset, isEditing, consigneeData]);

  const handleSameAsMailingChange = async (e: any) => {
    if (e.target.checked) {
      const values = getValues();
      setValue("billingAddress", values.address);
      setValue("billingAddressLine2", values.addressLine2);
      setValue("billingAddressLine3", values.addressLine3);
      setValue("billingCountry", values.country);
      setValue("billingState", values.state);
      setValue("billingCity", values.city);
      setValue("billingZip", values.zip);
      await trigger([
        "billingAddress",
        "billingCountry",
        "billingState",
        "billingCity",
        "billingZip",
      ]);
    } else {
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
      fields: ["address", "country", "state", "city", "zip"],
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
              <Input
                label="Billing Address"
                type="text"
                id="billingAddress"
                name="billingAddress"
                placeholder="Enter Primary Billing Address"
                register={register}
                errors={errors}
                errorMessage={VALIDATION_MESSAGES.addressRequired}
                required
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
        "billingAddress",
        "billingCountry",
        "billingState",
        "billingCity",
        "billingZip",
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
          <strong>Error: </strong>
          {error}
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
