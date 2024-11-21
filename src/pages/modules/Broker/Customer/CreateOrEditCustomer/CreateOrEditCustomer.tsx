import { FC, useEffect } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { REGEX_PATTERNS } from "../../../../../constants/patterns";
import { createUserForm } from "../../../../Auth/Signup/Signup";
import { Controller, useForm } from "react-hook-form";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import { createUser, editUser } from "../../../../../services/user/userService";
import { User } from "../../../../../types/User";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { PhoneInput } from "react-international-phone";
import { validatePhoneNumber } from "../../../../../utils/phoneValidate";

interface CreateOrEditCustomerProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing customer
  customerData?: Partial<User> | null; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditCustomer: FC<CreateOrEditCustomerProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  customerData,
  closeModal
}) => {
  const user = useSelector((state: RootState) => state.user);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<createUserForm>({
    mode: "onBlur",
    defaultValues: customerData || {}, // Pre-fill form when editing
  });

  const {
    createData: createCustomer,
    updateData: updateCustomer,
    loading,
    error,
  } = useFetchData<any>({
    createDataService: createUser,
    updateDataService: editUser,
  });

  /**
   * Handles form submission for creating or editing a customer.
   * @param data - Form data
   */
  const submit = async (data: createUserForm) => {
    try {
      let result;
      if (isEditing && customerData?._id) {
        // Update customer if editing
        result = await updateCustomer(customerData._id, data);
      } else {
        // Create customer with role assigned
        data.role = UserRole.CUSTOMER;
        data.brokerId = user._id;
        result = await createCustomer(data);
      }

      if (result.success) {
        toast.success(
          isEditing ? "Customer updated successfully." : "Customer created successfully."
        );
        setIsModalOpen(false);
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
      if (isEditing && customerData) {
        // Pre-fill form when editing
        reset(customerData);
      } else {
        // Clear form when creating
        reset({
          firstName: "",
          lastName: "",
          contactNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
          company: "",
        });
      }
    }
  }, [isModalOpen, reset, isEditing, customerData]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Customer" : "Create Customer"}
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

      {/* Form for creating/editing customer */}
      <form onSubmit={handleSubmit(submit)}>
        <div className="row mb-3">
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

          {/* Contact Number */}

          <div className="col-12 col-md-6">
            <label className="form-label text-dark-blue">
              Contact Number{"*"}
            </label>
            <Controller
              name="contactNumber"
              control={control}
              rules={{
                required: VALIDATION_MESSAGES.contactNumberRequired,
                validate: validatePhoneNumber,
              }}
              render={({ field }) => (
                <>
                  <PhoneInput
                    {...field}
                    defaultCountry="us"
                    required
                    className={errors.contactNumber ? "phone-is-invalid" : ""}
                    inputClassName={`w-100 phone-input form-control ${
                      errors.contactNumber ? "is-invalid" : ""
                    }`}
                    onChange={(phone) => field.onChange(phone)}
                  />
                  {errors.contactNumber && (
                    <div className="text-danger">
                      {errors.contactNumber.message}
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

          {/* Password (only for creating) */}
          {!isEditing && (
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
          )}

          {/* Company Name */}
          <div className="col-12">
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

        {/* Action Buttons */}
        <div className="row">
          <div className="col-12 mb-1 text-end">
            <button
              className="btn btn-secondary me-3"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
            <button
              className="btn btn-accent"
              type="submit"
              disabled={!isValid || loading}
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrEditCustomer;
