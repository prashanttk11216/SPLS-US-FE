import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserRole } from "../../../enums/UserRole";
import Input from "../../../components/common/Input/Input";
import { signup } from "../../../services/auth/authService";
import { VALIDATION_MESSAGES } from "../../../constants/messages";
import { REGEX_PATTERNS } from "../../../constants/patterns";
import MenWithBox from "../../../assets/images/menWithBox.svg";
import "./Signup.scss";
import { validatePhoneNumber } from "../../../utils/phoneValidate";
import Stepper, { Step } from "../../../components/common/Stepper/Stepper";
import CheckboxField from "../../../components/common/CheckboxField/CheckboxField";
import PlaceAutocompleteField from "../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import { Address } from "../../../types/Address";
import PasswordInput from "../../../components/common/PasswordInput/PasswordInput";
import PhoneNumberInput from "../../../components/common/PhoneNumberInput/PhoneNumberInput";
import { RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import { validateLocation } from "../../../utils/globalHelper";

interface SignupProps {
  role?: UserRole | null;
}

export type CreateUserForm = {
  _id?: string;
  // basic details
  firstName: string;
  lastName: string;
  primaryNumber: string;
  email: string;
  company?: string;

  //security details
  password: string;
  confirmPassword: string;

  address: {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  }; // Primary address (optional for non-customers)
  addressLine2?: string;
  addressLine3?: string;
  country: string;
  state: string;
  city: string;
  zip: string;

  sameAsMailing?: boolean;

  // Billing-specific fields (only for customers)
  billingAddress?: {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  };
  billingAddressLine2?: string;
  billingAddressLine3?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZip?: string;

  //other details
  roles: string[];
  employeeId?: string;
  brokerId: string;
  postedBy: string;
  avatarUrl?: string;
};

const Signup: React.FC<SignupProps> = ({ role }) => {
  const roles = useSelector((state: RootState) => state.roles);
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm<CreateUserForm>({ mode: "onBlur" });

  const submit = async (data: CreateUserForm) => {
    try {
      // Set default role based on props
      if (role === UserRole.CARRIER) {
        data.roles = roles.filter((role)=> role.name === UserRole.CARRIER).map((role)=>role._id);
      } else if (role === UserRole.CUSTOMER) {
        data.roles = roles.filter((role)=> role.name === UserRole.CUSTOMER).map((role)=>role._id);
      }
      data.brokerId = "67aa160fbcb994bc4edfbca4";
      data.postedBy = "67aa160fbcb994bc4edfbca4";

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
      setValue("billingAddress", {
        str: "",
        lat: 0,
        lng: 0,
      });
      setValue("billingAddressLine2", "");
      setValue("billingAddressLine3", "");
      setValue("billingCountry", "");
      setValue("billingState", "");
      setValue("billingCity", "");
      setValue("billingZip", "");
    }
  };

  const handlePlaceSelect = (
    details: Address,
    isBilling: boolean = false
  ) => {
    console.log("Selected Place Details:", details);
    if (isBilling) {
      setValue("billingCountry", details.country!);
      setValue("billingState", details.state!);
      setValue("billingCity", details.city!);
      setValue("billingZip", details.postal_code!);
    } else {
      setValue("country", details.country!);
      setValue("state", details.state!);
      setValue("city", details.city!);
      setValue("zip", details.postal_code!);
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
                    value: REGEX_PATTERNS.password,
                    message: VALIDATION_MESSAGES.emailInvalid,
                  },
                }}
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
          <div>
            {/* Mailing Address Section */}
            <div className="row">
              {/* Address */}
              <div className="col-12 col-md-4">
                 <PlaceAutocompleteField
                    name="address"
                    label="Address"
                    control={control}
                    placeholder="Enter address"
                    setValue={setValue}
                    rules={{ 
                      required: VALIDATION_MESSAGES.addressRequired,
                      validate: validateLocation,
                    }}
                    onPlaceSelect={handlePlaceSelect}
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
                  control={control}
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
                  control={control}
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
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.countryRequired,
                  }}
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
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.stateRequired,
                  }}
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
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.cityRequired,
                  }}
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
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.zipRequired,
                  }}
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
              control={control}
            />
          </div>
          {/* Billing Address */}
          <div className="col-12 col-md-4">
            <PlaceAutocompleteField
              name="billingAddress"
              label="Billing Address"
              control={control}
              placeholder="Enter Primary Billing Address"
              onPlaceSelect={(details) => handlePlaceSelect(details, true)}
              setValue={setValue}
              rules={{ 
                required: VALIDATION_MESSAGES.addressRequired,
                validate: validateLocation,
              }}
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
              control={control}
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
              control={control}
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
              control={control}
              rules={{
                required: VALIDATION_MESSAGES.countryRequired,
              }}
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
              control={control}
              rules={{
                required: VALIDATION_MESSAGES.stateRequired,
              }}
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
              control={control}
              rules={{
                required: VALIDATION_MESSAGES.cityRequired,
              }}
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
              control={control}
              rules={{
                required: VALIDATION_MESSAGES.zipRequired,
              }}
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
    {
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
              <div className="row mx-auto">
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
