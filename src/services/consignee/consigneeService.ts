import axiosApi from "../../api/axios";
import { createUserForm } from "../../pages/Auth/Signup/Signup";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

interface EditUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  primaryNumber?: string;
  // Add any other editable fields as needed
}

// export const getConsignee = async (query?: string): Promise<ApiResponse> => {
//   try {
//     const endpoint = `/consignee${query ? `?${query}` : ""}`;
//     const response = await axiosApi.get(endpoint, {
//       params: {
//         // Add any additional query parameters here
//         page: 1,
//         limit: 10,
//         search: "your_search_term",
//         isActive: true,
//         sortBy: "firstName",
//         sortOrder: "asc",
//       },
//     });
//     return handleResponse(response);
//   } catch (error) {
//     return handleAxiosError(error, "Failed to retrieve consignee details");
//   }
// };

// Fetch consignee details by ID
export const getConsigneeById = async (
  consigneeId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.get(`/consignee/${consigneeId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve consignee details");
  }
};

// Create a new consignee
export const createConsignee = async (
  data: createUserForm
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post("/consignee", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to create consignee");
  }
};

// Edit an existing consignee
export const editConsignee = async (
  consigneeId: string,
  data: EditUserData
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.put(`/consignee/${consigneeId}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update consignee details");
  }
};

// Delete a consignee
export const deleteConsignee = async (
  consigneeId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/consignee/${consigneeId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete consignee");
  }
};

// Toggle active status of consignee
export const toggleActiveConsignee = async (
  consigneeId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.patch(
      `/consignee/${consigneeId}/toggle-active`
    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to toggle consignee status");
  }
};
