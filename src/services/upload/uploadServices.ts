import axiosApi from "../../api/axios";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";
import { ApiResponse } from "../../types/responseTypes";

export const uploadSingleDocument = async (data: FormData): Promise<ApiResponse> => {

  try {
    const response = await axiosApi.post(`/upload/single`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to upload document");
  }
};

export const uploadMultipleDocument = async (data: FormData): Promise<ApiResponse> => {

  try {
    const response = await axiosApi.post(`/upload/multiple`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to upload documents");
  }
};
