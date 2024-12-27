import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Input from "../../../components/common/Input/Input";
import { login } from "../../../services/auth/authService";
import {
  setAuthTokenInStorage,
  setUserDataInStorage,
} from "../../../utils/authHelplers";
import { setUser } from "../../../features/user/userSlice";

import "./Login.scss";
import { VALIDATION_MESSAGES } from "../../../constants/messages";
import { REGEX_PATTERNS } from "../../../constants/patterns";
import { UserRole } from "../../../enums/UserRole";
import MenWithBox from "../../../assets/images/menWithBox.svg";

interface LoginProps {
  role?: UserRole | null;
}

export type LoginForm = {
  email?: string;
  employeeId?: string;
  password: string;
};

const Login: React.FC<LoginProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  const userRole = role === "broker" ? UserRole.BROKER_USER : undefined;

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginForm>({ mode: "onBlur" });

  // Handles form submission
  const submitForm = async (data: LoginForm) => {
    try {
      const result = await login(data);

      if (result.success) {
        setAuthTokenInStorage(result.data.token);
        setUserDataInStorage(result.data.user);
        dispatch(setUser(result.data.user));

        toast.success(result.message);
        if (
          result.data.user.role == UserRole.BROKER_ADMIN ||
          result.data.user.role == UserRole.BROKER_USER
        ) {
          navigate(`/broker`, {
            replace: true,
          });
        } else {
          navigate(`/${result.data.user.role}`, {
            replace: true,
          });
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div className="login-container container vh-100 d-flex align-items-center justify-content-center">
      <div className="row align-items-center">
        <div className="d-none d-lg-block col-lg-6">
          <img src={MenWithBox} />
        </div>
        <div className="col-12 col-lg-6">
          <div className="login-form mx-auto">
            <h2 className="fw-bolder text-center mb-5">Login</h2>
            <form onSubmit={handleSubmit(submitForm)} noValidate>
              <div className="row">
                {/* Employee Id Input for Broker User */}
                {userRole === UserRole.BROKER_USER ? (
                  <div className="col-12">
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
                ) : (
                  <div className="col-12">
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
                          value: REGEX_PATTERNS.password,
                          message: VALIDATION_MESSAGES.emailInvalid,
                        },
                      }}
                    />
                  </div>
                )}

                {/* Password Input */}
                <div className="col-12">
                  <Input
                    label="Password"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter Password"
                    control={control}
                    showEyeIcon={true}
                    rules={{
                      required: VALIDATION_MESSAGES.passwordRequired,
                    }}
                  />
                </div>

                {/* Forgot Password */}
                <div className="col-12 mb-4 text-end">
                  <Link
                    to="/forgot"
                    className="text-primary text-decoration-none"
                  >
                    Forgot Password
                  </Link>
                </div>

                {/* Submit Button */}
                <div className="col-12 mb-1 text-center">
                  <button
                    type="submit"
                    className="btn btn-sky-blue text-white w-100 fw-bold"
                    disabled={!isValid}
                  >
                    Login
                  </button>
                </div>
                {userRole !== UserRole.BROKER_USER && (
                  <>
                    <div className="col-12 text-center mt-2 mb-3">
                      <span className="fw-bold">OR</span>
                    </div>

                    {/* Sign Up Link */}
                    <div className="col-12 mb-1 text-center fw-bolder">
                      <span>Don't have an account?</span>{" "}
                      <Link
                        className="text-sky-blue text-decoration-none"
                        to="/signup"
                      >
                        Sign up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
