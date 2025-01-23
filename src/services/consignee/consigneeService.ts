import axiosApi from "../../api/axios";
import { ApiResponse } from "../../types/responseTypes";
import { Consignee } from "../../types/Consignee";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";


export const getConsignee = async (query?: string): Promise<ApiResponse> => {
    try {
        // Construct endpoint based on presence of userId and/or role
        let endpoint = "/consignee" + query;
    
        const response = await axiosApi.get(endpoint);
        return handleResponse(response);
      } catch (error) {
        return handleAxiosError(error, "Failed to retrieve user details");
      }
};

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
  data: Consignee
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
  data: Consignee
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