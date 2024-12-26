import { useForm } from "react-hook-form";
import { UserRole } from "../../../../enums/UserRole";
import { VALIDATION_MESSAGES } from "../../../../constants/messages";
import { REGEX_PATTERNS } from "../../../../constants/patterns";
import Input from "../../../../components/common/Input/Input";
import { useEffect, useState } from "react";
import {
  editUser,
  getUserProfile,
  uploadAvatar,
} from "../../../../services/user/userService";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";
import ProfileAvatar from "../../../../components/ProfileAvatar/ProfileAvatar";
import { validatePhoneNumber } from "../../../../utils/phoneValidate";
import PhoneInputField from "../../../../components/common/PhoneInputField/PhoneInputField";
import Stepper, { Step } from "../../../../components/common/Stepper/Stepper";
import PlaceAutocompleteField from "../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import CheckboxField from "../../../../components/common/CheckboxField/CheckboxField";
import { toast } from "react-toastify";

export type ProfileForm = {
  firstName: string;
  lastName: string;
  company: string;
  primaryNumber: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  avatarUrl: string;

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
};

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [activeStep, setActiveStep] = useState(0); // Tracks current step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
    setValue,
    getValues,
    trigger,
  } = useForm<ProfileForm>({ mode: "onBlur" });

  useEffect(() => {
    const getProfile = async () => {
      const result = await getUserProfile();
      if (result.success && result.data) {
        reset(result.data); // Pre-filling form data with user profile data
      }
      console.log(result);
    };
    getProfile();
  }, []);

  const submit = async (data: ProfileForm) => {
    try {
      // Use editUser to update the user profile
      const response = await editUser(user._id, data);
      if (response.success) {
        toast.success("Profile updated successfully");
        reset(response.data); // Reset the form with the latest data
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred while updating the profile.");
    }
  };

  const onAvatarChange = async (file: File) => {
    try {
      const response = await uploadAvatar(file); // Use the new uploadAvatar service
      if (response.success) {
        reset({ ...getValues(), avatarUrl: response.data.avatarUrl });
        toast.success("Avatar updated successfully");
      } else {
        toast.error("Avatar upload failed");
      }
    } catch (err) {
      toast.error("An error occurred while uploading the avatar.");
    }
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
      setValue("billingAddress", "");
      setValue("billingAddressLine2", "");
      setValue("billingAddressLine3", "");
      setValue("billingCountry", "");
      setValue("billingState", "");
      setValue("billingCity", "");
      setValue("billingZip", "");
    }
  };

  const handlePlaceSelect = (
    details: {
      formatted_address: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      lat: number | null;
      lng: number | null;
    },
    isBilling: boolean = false
  ) => {
    console.log("Selected Place Details:", details);
    if (isBilling) {
      setValue("billingAddress", {
        str: details.formatted_address!,
        lat: details.lat!,
        lng: details.lng!,
      });
      setValue("billingCountry", details.country!);
      setValue("billingState", details.state!);
      setValue("billingCity", details.city!);
      setValue("billingZip", details.postal_code!);
    } else {
      setValue("address", {
        str: details.formatted_address!,
        lat: details.lat!,
        lng: details.lng!,
      });
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
                  rules={{ required: VALIDATION_MESSAGES.addressRequired }} // Example validation
                  required
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
              rules={{ required: VALIDATION_MESSAGES.addressRequired }} // Example validation
              required
              onPlaceSelect={(details) => handlePlaceSelect(details, true)}
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
    <div className="container vh-100 d-flex align-items-center">
      <div className="profile-form">
        <div className="mb-4">
          <ProfileAvatar
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            avatarUrl={getValues("avatarUrl")}
            onAvatarChange={onAvatarChange}
          />
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <div className="row">
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
                    className="btn btn-primary"
                    disabled={!isValid}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
