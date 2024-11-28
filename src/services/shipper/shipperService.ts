import axiosApi from "../../api/axios";
import { ShipperForm } from "../../pages/modules/Broker/Shipper/CreateOrEditShipper/CreateOrEditShipper";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";


export const getShipper = async (query?: string): Promise<ApiResponse> => {
    try {
        // Construct endpoint based on presence of userId and/or role
        let endpoint = "/shipper" + query;
    
        const response = await axiosApi.get(endpoint);
        return handleResponse(response);
      } catch (error) {
        return handleAxiosError(error, "Failed to retrieve user details");
      }
};

// Fetch shipper details by ID
export const getShipperById = async (
  shipperId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.get(`/shipper/${shipperId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve shipper details");
  }
};

// Create a new shipper
export const createShipper = async (
  data: ShipperForm
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post("/shipper", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to create shipper");
  }
};

// Edit an existing shipper
export const editShipper = async (
  shipperId: string,
  data: ShipperForm
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.put(`/shipper/${shipperId}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update shipper details");
  }
};

// Delete a shipper
export const deleteShipper = async (
  shipperId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/shipper/${shipperId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete shipper");
  }
};

// Toggle active status of shipper
export const toggleActiveShipper = async (
  shipperId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.patch(
      `/shipper/${shipperId}/toggle-active`
    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to toggle shipper status");
  }
};