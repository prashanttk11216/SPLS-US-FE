import axiosApi from "../../api/axios";
import { Load } from "../../types/Load";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

export const getloads = async (query?: string): Promise<ApiResponse> => {
  try {
    const endpoint = "/dispatch" + query;

    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const getLoadById = async (loadId: string, query?: string): Promise<ApiResponse> => {
  try {
    const endpoint = "/dispatch/" + loadId + query;

    const response = await axiosApi.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to retrieve user details");
  }
};

export const createLoad = async (data: Load): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>("/dispatch", data);
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
    const response = await axiosApi.put(`/dispatch/${loadId}`, data);
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
    const response = await axiosApi.put(`/dispatch/${loadId}/status`, data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to update Load status");
  }
};

export const deleteLoad = async (loadId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.delete(`/dispatch/${loadId}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete Load");
  }
};

export const refreshAgeforLoad = async (data: any): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>(
      "/dispatch/refresh-age",
      data
    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const rateConfirmationforLoad = async (
  loadId: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>("/dispatch/rate-confirmation/" + loadId,{});
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const BOLforLoad = async (loadId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>(
      "/dispatch/BOL/" + loadId,
      {}    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const invoicedforLoad = async (loadId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>(
      "/dispatch/invoiced/" + loadId,
      {}    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const exportAccountSummary = async (data: any): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>("/dispatch/accounting-summary", data);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const exportLoads = async (data: any): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>(
      "/dispatch/accounting-export",
      data,  { responseType: "blob" }
    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};

export const downloadReport = async (data: any): Promise<ApiResponse> => {
  try {
    const response = await axiosApi.post<ApiResponse>(
      "/dispatch/reports",
      data, { responseType: "blob" }
    );
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "failed");
  }
};
