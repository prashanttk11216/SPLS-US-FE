import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ApiResponse } from "../../types/responseTypes";

interface ApiServices<T, U = T> {
  getAll?: { [key: string]: (params?: any) => Promise<ApiResponse<T[]>> };
  getById?: { [key: string]: (id: string, params?: any) => Promise<ApiResponse<T>> };
  create?: { [key: string]: (data: U) => Promise<ApiResponse<T>> };
  update?: { [key: string]: (id: string, data: T) => Promise<ApiResponse<T>> };
  remove?: { [key: string]: (id: string) => Promise<ApiResponse<null>> };
}

const useFetchData = <T, U = T>(services: ApiServices<T, U>) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleError = (err: any, fallbackMessage: string): ApiResponse => {
    const errorMessage = err?.message || fallbackMessage;
    console.error(errorMessage);
    setError(errorMessage);
    toast.error(errorMessage);
    return { success: false, code: 500, message: errorMessage, data: null, meta: {} };
  };

  const getData = useCallback(async (key: string, params?: any): Promise<ApiResponse<T[]>> => {
    if (!services.getAll?.[key]) return handleError(null, `Service '${key}' is not defined`);
    
    setLoading(true);
    setError("");
    try {
      return await services.getAll[key](params);
    } catch (err) {
      return handleError(err, `Failed to fetch '${key}' data`);
    } finally {
      setLoading(false);
    }
  }, [services.getAll]);

  const getDataById = useCallback(async (key: string, id: string, params?: any): Promise<ApiResponse<T>> => {
    if (!services.getById?.[key]) return handleError(null, `Service '${key}' is not defined`);
    
    setLoading(true);
    setError("");
    try {
      return await services.getById[key](id, params);
    } catch (err) {
      return handleError(err, `Failed to fetch '${key}' data by ID`);
    } finally {
      setLoading(false);
    }
  }, [services.getById]);

  const createData = useCallback(async (key: string, data: U): Promise<ApiResponse<T>> => {
    if (!services.create?.[key]) return handleError(null, `Service '${key}' is not defined`);
    
    setLoading(true);
    setError("");
    try {
      return await services.create[key](data);
    } catch (err) {
      return handleError(err, `Failed to create '${key}'`);
    } finally {
      setLoading(false);
    }
  }, [services.create]);

  const updateData = useCallback(async (key: string, id: string, data: T): Promise<ApiResponse<T>> => {
    if (!services.update?.[key]) return handleError(null, `Service '${key}' is not defined`);
    
    setLoading(true);
    setError("");
    try {
      return await services.update[key](id, data);
    } catch (err) {
      return handleError(err, `Failed to update '${key}'`);
    } finally {
      setLoading(false);
    }
  }, [services.update]);

  const deleteData = useCallback(async (key: string, id: string): Promise<ApiResponse<null>> => {
    if (!services.remove?.[key]) return handleError(null, `Service '${key}' is not defined`);
    
    setLoading(true);
    setError("");
    try {
      return await services.remove[key](id);
    } catch (err) {
      return handleError(err, `Failed to delete '${key}'`);
    } finally {
      setLoading(false);
    }
  }, [services.remove]);

  return { getData, getDataById, createData, updateData, deleteData, loading, error };
};

export default useFetchData;
