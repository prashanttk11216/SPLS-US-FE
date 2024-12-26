import axiosApi from "../../api/axios";
import { createUserForm } from "../../pages/Auth/Signup/Signup";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

// Interface for the data expected in edit requests
interface EditUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  primaryNumber?: string;

  avatarUrl?: string;
  company?: string;

  address?: string;
  addressLine2?: string;
  addressLine3?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;

  billingAddress?: string;
  billingAddressLine2?: string;
  billingAddressLine3?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZip?: string;

  sameAsMailing?: boolean;
  // Add any other editable fields as needed
}

// Fetch user details by ID or filter by role - Private API (requires Authorization token)
export const getUsers = async (
  query?: string
): Promise<ApiResponse> => {
  try {
    // Construct endpoint based on presence of userId and/or role
    let endpoint = "/user" + query;

    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const getUserById = async (
  userId: string,
  role?: string
): Promise<ApiResponse> => {
  try {
    // Construct endpoint based on presence of userId and/or role
    let endpoint = `/user/${userId}`;

    // Add role as a query parameter if provided and no userId is specified
    if (role) {
      endpoint += `?role=${role}`;
    }

    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const getUserProfile = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.get(`/user/me`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const createUser = async (data: createUserForm): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>("/user/create?isAdmin=true", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Signup failed");
  }
};


export const createBroker = async (data: createUserForm): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>("/user/create/broker-user", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Signup failed");
  }
};

export const editUser = async (
  userId: string,
  data: EditUserData
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.put(`/user/${userId}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update user details");
  }
};

export const uploadAvatar = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosApi.post(`/upload/single`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to upload avatar");
  }
};


export const toggleActiveStatus = async (
  userId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.patch(`/user/${userId}/toggle-active`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update user Status");
  }
};

export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/user/${userId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete user");
  }
};
