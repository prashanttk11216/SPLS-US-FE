import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ApiResponse } from "../../types/responseTypes";

interface UseFetchDataProps<T, U = T> {
  fetchDataService?: (params?: any) => Promise<ApiResponse<T[]>>;
  fetchByIdService?: (id: string) => Promise<ApiResponse<T>>;
  createDataService?: (data: U) => Promise<ApiResponse<T>>;
  updateDataService?: (id: string, data: T) => Promise<ApiResponse<T>>;
  deleteDataService?: (id: string) => Promise<ApiResponse<null>>;
}

const useFetchData = <T, U = T>({
  fetchDataService,
  fetchByIdService,
  createDataService,
  updateDataService,
  deleteDataService,
}: UseFetchDataProps<T, U>) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleError = (err: any, fallbackMessage: string): ApiResponse => {
    const errorMessage = err.message || fallbackMessage;
    console.error(errorMessage);
    setError(errorMessage);
    toast.error(errorMessage);
    return {
      success: false,
      code: 500, // Default error code (can be adjusted based on the API)
      message: errorMessage,
      data: null,
      meta: {},
    };
  };

  const fetchData = useCallback(async (params?: any): Promise<ApiResponse<T[]>> => {
    if (!fetchDataService) {
      return handleError(null, "fetchDataService is not defined");
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchDataService(params);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data");
      }
      return result;
    } catch (err) {
      return handleError(err, "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetchDataService]);

  const fetchDataById = useCallback(async (id: string): Promise<ApiResponse<T>> => {
    if (!fetchByIdService) {
      return handleError(null, "fetchByIdService is not defined");
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchByIdService(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data by id");
      }
      return result;
    } catch (err) {
      return handleError(err, "Failed to fetch data by id");
    } finally {
      setLoading(false);
    }
  }, [fetchByIdService]);

  const createData = useCallback(async (data: U): Promise<ApiResponse<T>> => {
    if (!createDataService) {
      return handleError(null, "createDataService is not defined");
    }
    setLoading(true);
    setError("");
    try {
      const result = await createDataService(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create data");
      }
      return result;
    } catch (err) {
      return handleError(err, "Failed to create data");
    } finally {
      setLoading(false);
    }
  }, [createDataService]);

  const updateData = useCallback(async (id: string, data: T): Promise<ApiResponse<T>> => {
    if (!updateDataService) {
      return handleError(null, "updateDataService is not defined");
    }
    setLoading(true);
    setError("");
    try {
      const result = await updateDataService(id, data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update data");
      }
      return result;
    } catch (err) {
      return handleError(err, "Failed to update data");
    } finally {
      setLoading(false);
    }
  }, [updateDataService]);

  const deleteDataById = useCallback(async (id: string): Promise<ApiResponse<null>> => {
    if (!deleteDataService) {
      return handleError(null, "deleteDataService is not defined");
    }
    setLoading(true);
    setError("");
    try {
      const result = await deleteDataService(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete data");
      }
      return result;
    } catch (err) {
      return handleError(err, "Failed to delete data");
    } finally {
      setLoading(false);
    }
  }, [deleteDataService]);

  return { fetchData, fetchDataById, createData, updateData, deleteDataById, loading, error };
};

export default useFetchData;
