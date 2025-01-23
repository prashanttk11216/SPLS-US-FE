import React, { useState } from "react";
import "./ForgotPassword.scss";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../../../components/common/Input/Input";
import {
  requestPasswordReset,
  resetPassword,
} from "../../../services/auth/authService";
import { toast } from "react-toastify";
import { VALIDATION_MESSAGES } from "../../../constants/messages";
import { REGEX_PATTERNS } from "../../../constants/patterns";
import MenWithBox from "../../../assets/images/menWithBox.svg";

export type ForgotPasswordForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const ForgotPassword: React.FC = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
  } = useForm<ForgotPasswordForm>({ mode: "onBlur" });

  const validatePassword = (value: string) =>
    watch("password") === value || "Passwords do not match";

  const handlePasswordReset = async (data: ForgotPasswordForm) => {
    try {
      const result = await resetPassword({ ...data, email: userEmail });
      if (result.success) {
        toast.success(result.message);
        navigate("/login");
      } else {
        resetEmailState();
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to reset the password. Please try again.");
    }
  };

  const handleEmailVerification = async (email: string) => {
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setIsEmailVerified(true);
        setUserEmail(email);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Failed to verify the email. Please try again.");
    }
  };

  const resetEmailState = () => {
    setIsEmailVerified(false);
    setUserEmail("");
  };

  return (
    <div className="forgot-container container vh-100 d-flex align-items-center justify-content-center">
      <div className="row align-items-center w-100">
        <div className="d-none d-lg-block col-lg-8">
          <img src={MenWithBox} alt="Men with Box" />
        </div>
        <div className="col-12 col-lg-4">
          <form onSubmit={handleSubmit(handlePasswordReset)}>
            <div className="row">
              <div className="col-12 mb-1">
                <Input
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  control={control}
                  disabled={isEmailVerified}
                  rules={{
                    required: VALIDATION_MESSAGES.emailRequired,
                    pattern: {
                      value: REGEX_PATTERNS.password,
                      message: VALIDATION_MESSAGES.emailInvalid,
                    },
                  }}
                />
              </div>

              {isEmailVerified && (
                <>
                  <div className="col-12 mb-1">
                    <Input
                      label="Password"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter Password"
                      showEyeIcon={true}
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

                  <div className="col-12 mb-1">
                    <Input
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      showEyeIcon={true}
                      control={control}
                      rules={{
                        required: VALIDATION_MESSAGES.confirmPasswordRequired,
                        validate: validatePassword,
                      }}
                    />
                  </div>
                </>
              )}

              <div className="col-12 text-center">
                {isEmailVerified ? (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isValid}
                  >
                    Reset Password
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleEmailVerification(watch("email"))}
                    disabled={!isValid}
                  >
                    Verify Email
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger ms-2"
                  onClick={() => navigate("/login")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
