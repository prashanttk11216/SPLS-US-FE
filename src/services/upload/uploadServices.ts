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

export const deleteUploadedDocument = async (file_name: any): Promise<ApiResponse> => {

  try {
    const response = await axiosApi.delete(`/upload/delete/${file_name}`);
    return handleResponse(response);
  } catch (error) {
    return handleAxiosError(error, "Failed to upload document");
  }
};

export const deleteDocument = async (loadId:string, file_name: any): Promise<ApiResponse> => {

  try {
    const response = await axiosApi.put(`/dispatch/document/${loadId}/${file_name}`);
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
