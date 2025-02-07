import { publicApi } from "../../api/axios";
import { ForgotPasswordForm } from "../../pages/Auth/Forgot/ForgotPassword";
import { LoginForm } from "../../pages/Auth/Login/Login";
import { CreateUserForm } from "../../pages/Auth/Signup/Signup";
import { VerifyUserForm } from "../../pages/Auth/VerifyUser/VerifyUser";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

// Login request - public API (no token needed)
export const login = async (data: LoginForm): Promise<ApiResponse> => {
  try {
    const response = await publicApi.post<ApiResponse>("/user/login", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Login failed");
  }
};

// Signup request - public API (no token needed)
export const signup = async (data: CreateUserForm): Promise<ApiResponse> => {
  try {
    const response = await publicApi.post<ApiResponse>("/user/create", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Signup failed");
  }
};

// Request password reset - public API
export const requestPasswordReset = async (
  email: string
): Promise<ApiResponse> => {
  try {
    const response = await publicApi.post<ApiResponse>("/user/request-reset-password", { email });
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Password reset request failed");
  }
};

// Reset password confirmation - public API
export const resetPassword = async (
  data: ForgotPasswordForm
): Promise<ApiResponse> => {
  try {
    const response = await publicApi.post<ApiResponse>("/user/reset-password", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Password reset failed");
  }
};

// verify User - public API (no token needed)
export const verifyUser = async (data: VerifyUserForm): Promise<ApiResponse> => {
  try {
    const response = await publicApi.post<ApiResponse>("/otp/verify", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Verification failed");
  }
};

// verify User - public API (no token needed)
export const resendVerificationOTP = async (data: { email: string}): Promise<ApiResponse> => {
  try {
    const response = await publicApi.post<ApiResponse>("/otp/resend", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Verification failed");
  }
};
