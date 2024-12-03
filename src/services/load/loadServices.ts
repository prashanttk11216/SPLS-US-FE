import axiosApi from "../../api/axios";
import { Load } from "../../types/Load";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

export const getloads = async (query?: string): Promise<ApiResponse> => {
  try {
    let endpoint = "/load" + query;

    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const getLoadById = async (loadId: string): Promise<ApiResponse> => {
  try {
    let endpoint = "/load/" + loadId;

    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const createLoad = async (
  data: Load
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>("/load", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const editLoad = async (
  loadId: string,
  data: Load
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.put(`/load/${loadId}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update Load details");
  }
};

export const updateLoadStatus = async (
  loadId: string,
  data: any
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.put(`/load/${loadId}/status`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update Load status");
  }
};

export const deleteLoad = async (loadId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/load/${loadId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete Load");
  }
};
