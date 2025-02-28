import axiosApi from "../../api/axios";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

export const getBrokerDashboardData = async (): Promise<ApiResponse> => {
    try {
      const endpoint = "/dashboard/broker-dashboard-board-stats"
      const response = await axiosApi.get(endpoint);
      return handleResponse(response);
    } catch (error) {
      return handleAxiosError(error, "Failed to retrieve user details");
    }
};