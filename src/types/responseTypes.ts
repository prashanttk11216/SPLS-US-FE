// Define a generic interface for the response structure from the server

export interface ApiResponse<T = any> {
    success: boolean;        // Indicates if the request was successful (based on the status code)
    code: number;            // The HTTP status code of the response
    message: string;         // The message associated with the status code or custom message
    data: T | null;          // The data returned from the server (can be any type)
    meta: Record<string, any>; // Any optional metadata related to the response
  }
  
  