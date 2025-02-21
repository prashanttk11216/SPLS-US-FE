import axiosApi from "../../api/axios";
import { IQuote } from "../../types/Quote";
import { ApiResponse } from "../../types/responseTypes";
import { handleResponse } from "../../utils/apiHelpers";
import { handleAxiosError } from "../../utils/errorHandler";

export const getQuotes = async (query?: string): Promise<ApiResponse> => {
    try {
        // Construct endpoint based on presence of userId and/or quote
        let endpoint = "/quote";
        if(query) endpoint += query;

        const response = await axiosApi.get(endpoint);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to retrieve quote details");
    }
};

// Fetch role details by ID
export const getQuoteById = async (
    quoteId: string
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.get(`/quote/${quoteId}`);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to retrieve quote details");
    }
};

// Create a new role
export const createQuote = async (
    data: IQuote
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.post("/quote", data);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to create quote");
    }
};

// Edit an existing quote
export const editQuote = async (
    quoteId: string,
    data: IQuote
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.put(`/quote/${quoteId}`, data);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to update quote details");
    }
};

// Delete a quote
export const deleteQuote = async (
    quoteId: string
): Promise<ApiResponse> => {
    try {
        const response = await axiosApi.delete(`/quote/${quoteId}`);
        return handleResponse(response);
    } catch (error) {
        return handleAxiosError(error, "Failed to delete quote");
    }
};