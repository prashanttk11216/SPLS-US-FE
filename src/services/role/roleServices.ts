import axiosApi, { publicApi } from "../../api/axios";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";
import { IRole } from "../../schema/Role";

export const getRoles = async (query?: string): Promise<ApiResponse> => {
    try {
        // Construct endpoint based on presence of userId and/or role
        let endpoint = "/role";
        if(query) endpoint += query;

        const response = await publicApi.get(endpoint);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to retrieve roles details");
    }
};

// Fetch role details by ID
export const getRoleById = async (
    roleId: string
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.get(`/role/${roleId}`);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to retrieve role details");
    }
};

// Create a new role
export const createRole = async (
    data: IRole
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.post("/role", data);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to create role");
    }
};

// Edit an existing role
export const editRole = async (
    roleId: string,
    data: IRole
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.put(`/role/${roleId}`, data);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to update role details");
    }
};

// Delete a role
export const deleteRole = async (
    roleId: string
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.delete(`/role/${roleId}`);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to delete role");
    }
};