import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserRole } from "../../../enums/UserRole";
import Input from "../../../components/common/Input/Input";
import { signup } from "../../../services/auth/authService";
import { VALIDATION_MESSAGES } from "../../../constants/messages";
import { REGEX_PATTERNS } from "../../../constants/patterns";
import MenWithBox from "../../../assets/images/menWithBox.svg";
import { PhoneInput } from "react-international-phone";
import "./Signup.scss";
import { validatePhoneNumber } from "../../../utils/phoneValidate";
import Stepper, { Step } from "../../../components/common/Stepper/Stepper";
import CheckboxField from "../../../components/common/CheckboxField/CheckboxField";

interface SignupProps {
  role?: UserRole | null;
}

export type createUserForm = {
  // basic details
  firstName: string;
  lastName: string;
  company: string;
  primaryNumber: string;
  email: string;

  //security details
  password: string;
  confirmPassword: string;

  address: string; // Primary address (optional for non-customers)
  addressLine2?: string;
  addressLine3?: string;
  country: string;
  state: string;
  city: string;
  zip: string;

  sameAsMailing?: boolean;

  // Billing-specific fields (only for customers)
  billingAddress?: string;
  billingAddressLine2?: string;
  billingAddressLine3?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZip?: string;

  //other details
  role: UserRole;
  employeeId?: string;
  brokerId: string;
};

const Signup: React.FC<SignupProps> = ({ role }) => {
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm<createUserForm>({ mode: "onBlur" });


  const submit = async (data: createUserForm) => {
    try {
      // Set default role based on props
      if (role === UserRole.CARRIER) {
        data.role = UserRole.CARRIER;
      } else if (role === UserRole.CUSTOMER) {
        data.role = UserRole.CUSTOMER;
      }
      data.brokerId = "672b1afe59aeb9920f06690e";
      // Call signup service
      const result = await signup(data);

      // Display appropriate success/error messages
      if (result.success) {
        toast.success(result.message);
        navigate(`/verify?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("An error occurred while signing up. Please try again.");
    }
  };

  const validatePassword = (val: string) => {
    return watch("password") === val || "Passwords do not match";
  };

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
          <div>
            {/* Mailing Address Section */}
            <div className="row">
              {/* Address */}
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
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
    ...(role === UserRole.CUSTOMER
      ? [
          {
            label: "Billing Address",
            content: (
              <div className="row">
                {/* Billing Address Section */}
                <div className="d-flex align-items-center my-3">
                  <CheckboxField
                    label="Same as Mailing Address"
                    id="sameAsMailing"
                    name="sameAsMailing"
                    onChange={handleSameAsMailingChange}
                    register={register}
                    errors={errors}
                  />
                </div>
                {/* Billing Address */}
                <div className="col-12 col-md-4">
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
                <div className="col-12 col-md-4">
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
                <div className="col-12 col-md-4">
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
                <div className="col-12 col-md-4">
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
                <div className="col-12 col-md-4">
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
                <div className="col-12 col-md-4">
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
                <div className="col-12 col-md-4">
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
        ]
      : []),
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
  ];

  

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

  return (
    <>
      {/* Main container for centering form */}
      <div className="container vh-100 d-flex align-items-center justify-content-center">
        <div className="row align-items-center w-100">
          <div className="d-none d-lg-block col-lg-6">
            <img src={MenWithBox} alt="Men with Box" />
          </div>
          <div className="col-12 col-lg-6">
            <div className="signup-form">
              <h2 className="fw-bolder text-center mb-5">Sign Up</h2>

              {/* Form for creating/editing customer */}
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
                      type="submit"
                      className="btn btn-sky-blue text-white  fw-bold"
                      disabled={!isValid}
                      onClick={handleSubmit(submit)}
                    >
                      Sign up
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="row">
                <div className="col-12 text-center mt-2 mb-3">
                  <span className="fw-bold">OR</span>
                </div>

                {/* Link to Login for Existing Users */}
                <div className="col-12 mb-1 text-center fw-bolder">
                  <span>Already have an account?</span>{" "}
                  <Link
                    className="text-sky-blue text-decoration-none"
                    to="/login"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
