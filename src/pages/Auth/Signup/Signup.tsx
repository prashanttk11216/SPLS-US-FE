import React from "react";
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

interface SignupProps {
  role?: UserRole | null;
}

export type createUserForm = {
  firstName: string;
  lastName: string;
  company: string;
  primaryNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  employeeId?: string;
  brokerId: string;
};

const Signup: React.FC<SignupProps> = ({ role }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
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

  return (
    <>
      {/* Main container for centering form */}
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="row align-items-center">
        <div className="d-none d-lg-block col-lg-6">
          <img src={MenWithBox} alt="Men with Box" />
        </div>
        <div className="col-12 col-lg-6">
          <div className="signup-form">
            <h2 className="fw-bolder text-center mb-5">Sign Up</h2>
            <form onSubmit={handleSubmit(submit)}>
              <div className="row mb-3">
                  {/* First Name Input */}
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

                  {/* Last Name Input */}
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

                  {/* Primary Number Input */}
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

                  {/* Email Input */}
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

                  {/* Password Input */}
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

                  {/* Confirm Password Input */}
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

                  {/* Company Name Input (Optional) */}
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

                  {/* Role Selection for Broker Admin */}
                  {/* {role === UserRole.BROKER_ADMIN && (
                  <div className="col-12 col-md-6 mb-1">
                    <Select
                      label="Role"
                      id="role"
                      name="role"
                      options={[
                        { value: UserRole.BROKER_ADMIN, label: "Broker Admin" },
                        { value: UserRole.BROKER_USER, label: "Broker User" },
                      ]}
                      register={register}
                      errors={errors}
                      errorMessage={VALIDATION_MESSAGES.roleRequired}
                      required
                    />
                  </div>
                )} */}
              </div>

                {/* Submit Button */}
              <div className="row">
                <div className="col-12 mb-1 text-center">
                  <button
                    type="submit"
                    className="btn btn-sky-blue text-white w-100 fw-bold"
                    disabled={!isValid}
                  >
                    Sign up
                  </button>
                </div>

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
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Signup;
