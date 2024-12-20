import axiosApi from "../../api/axios";
import { ApiResponse } from "../../types/responseTypes";
import { Truck } from "../../types/Truck";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";


export const getTrucks = async (query?: string): Promise<ApiResponse> => {
    try {
        // Construct endpoint based on presence of userId and/or role
        let endpoint = "/truck" + query;
    
        const response = await axiosApi.get(endpoint);
        return handleResponse(response);
      } catch (error) {
        return handleAxiosError(error, "Failed to retrieve truck details");
      }
};

// Fetch truck details by ID
export const getTruckById = async (
  truckId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.get(`/truck/${truckId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve truck details");
  }
};

// Create a new consignee
export const createTruck = async (
  data: Truck
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post("/truck", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to create truck");
  }
};

// Edit an existing consignee
export const editTruck = async (
  truckId: string,
  data: Truck
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.put(`/truck/${truckId}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update truck details");
  }
};

// Delete a consignee
export const deleteTruck = async (
  truckId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/truck/${truckId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete truck");
  }
};

// Fetch matches truck details by load ID
export const getMatchesTrucks = async (
  loadId: string, query?: string
): Promise<ApiResponse> => {
  try {
    let endpoint = `/truck/matches/${loadId}` + query;
    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve truck details");
  }
};