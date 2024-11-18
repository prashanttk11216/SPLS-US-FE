import axios from "axios";
import { ApiResponse } from "../types/responseTypes";

// Helper function to handle Axios errors
export const handleAxiosError = (
  error: unknown,
  defaultMessage: string
): ApiResponse => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      ...error.response?.data, 
      message: error.response?.data?.message || defaultMessage
    };
  } else {
    console.error("Unexpected Error:", error);
    return {
      success: false,
      code: 500,
      message: "An unexpected error occurred",
      data: null,
      meta: {},
    };
  }
};
