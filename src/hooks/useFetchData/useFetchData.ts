import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ApiResponse } from "../../types/responseTypes";

interface UseFetchDataProps<T, U = T> {
  fetchDataService?: (params?: any) => Promise<ApiResponse>;
  fetchByIdService?: (id: string) => Promise<ApiResponse>;
  createDataService?: (data: U) => Promise<ApiResponse>;
  updateDataService?: (id: string, data: T) => Promise<ApiResponse>;
  deleteDataService?: (id: string) => Promise<ApiResponse>;
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

  const fetchData = useCallback(async (params?: any) => {
    if (!fetchDataService) {
      setError("fetchDataService is not defined");
      toast.error("fetchDataService is not defined");
      return { success: false, message: "Service not available", data: [] };
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchDataService(params);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data");
      }
      return result;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
      return { success: false, message: err.message, data: [] };
    } finally {
      setLoading(false);
    }
  }, [fetchDataService]);

  const fetchDataById = useCallback(async (id: string) => {
    if (!fetchByIdService) {
      setError("fetchByIdService is not defined");
      toast.error("fetchByIdService is not defined");
      return { success: false, message: "Service not available", data: null };
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchByIdService(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data by id");
      }
      return result;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
      return { success: false, message: err.message, data: null };
    } finally {
      setLoading(false);
    }
  }, [fetchByIdService]);

  const createData = useCallback(async (data: U) => {
    if (!createDataService) {
      setError("createDataService is not defined");
      toast.error("createDataService is not defined");
      return { success: false, message: "Service not available" };
    }
    setLoading(true);
    setError("");
    try {
      const result = await createDataService(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create data");
      }
      return result;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [createDataService]);

  const updateData = useCallback(async (id: string, data: T) => {
    if (!updateDataService) {
      setError("updateDataService is not defined");
      toast.error("updateDataService is not defined");
      return { success: false, message: "Service not available" };
    }
    setLoading(true);
    setError("");
    try {
      const result = await updateDataService(id, data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update data");
      }
      return result;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [updateDataService]);

  const deleteDataById = useCallback(async (id: string) => {
    if (!deleteDataService) {
      setError("deleteDataService is not defined");
      toast.error("deleteDataService is not defined");
      return { success: false, message: "Service not available" };
    }
    setLoading(true);
    setError("");
    try {
      const result = await deleteDataService(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete data");
      }
      return result;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [deleteDataService]);

  return { fetchData, fetchDataById, createData, updateData, deleteDataById, loading, error };
};

export default useFetchData;
