import { useForm } from "react-hook-form";
import { UserRole } from "../../../../enums/UserRole";
import { VALIDATION_MESSAGES } from "../../../../constants/messages";
import { REGEX_PATTERNS } from "../../../../constants/patterns";
import Input from "../../../../components/common/Input/Input";
import { useEffect } from "react";
import { getUserProfile } from "../../../../services/user/userService";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";
import ProfileAvatar from "../../../../components/ProfileAvatar/ProfileAvatar";
import { validatePhoneNumber } from "../../../../utils/phoneValidate";
import PhoneInputField from "../../../../components/common/PhoneInputField/PhoneInputField";

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
};

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ProfileForm>({ mode: "onBlur" });

  useEffect(() => {
    const getProfile = async () => {
      const result = await getUserProfile();
      if (result.success && result.data) {
        reset(result.data.user); // Pre-filling form data with user profile data
      }
    };
    getProfile();
  }, []);

  const submit = (data: ProfileForm) => {
    console.log("Submitted data:", data);
    // Implement save functionality here
  };

  const onAvatarChange = (file: File) => {
    console.log(file);
  };

  return (
    <div className="container vh-100 d-flex align-items-center">
      <div className="profile-form">
        <div className="mb-3">
          <ProfileAvatar
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            onAvatarChange={onAvatarChange}
          />
        </div>
        <form onSubmit={handleSubmit(submit)}>
          <div className="row">
            {/* First Name Input */}
            <div className="col-12 col-md-6 mb-1">
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

            {/* Last Name Input */}
            <div className="col-12 col-md-6 mb-1">
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

            {/* Primary Number Input */}

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

            {/* Email Input */}
            <div className="col-12 col-md-6 mb-1">
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                control={control}
                disabled={true}
                rules={{
                  required: VALIDATION_MESSAGES.emailRequired,
                  pattern: {
                    value: REGEX_PATTERNS.email,
                    message: VALIDATION_MESSAGES.emailInvalid,
                  },
                }}
              />
            </div>

            {/* Company Name Input (Optional) */}
            <div className="col-12 col-md-6 mb-1">
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

          {/* Submit Button */}
          <div className="row">
            <div className="col-12 mb-1 text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isValid}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
