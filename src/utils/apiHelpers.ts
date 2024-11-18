import { AxiosResponse } from "axios";

// Helper function to handle responses and provide consistent return type
export const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};
