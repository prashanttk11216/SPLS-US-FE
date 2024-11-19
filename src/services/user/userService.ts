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
  contactNumber?: string;
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

export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/user/${userId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete user");
  }
};
