export const getAuthTokenFromStorage = (): string | null => localStorage.getItem("authToken");

export const setAuthTokenInStorage = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthTokenFromStorage = (): void => {
  localStorage.removeItem("authToken");
};

export const setUserDataInStorage = (data: unknown): void => {
  localStorage.setItem("user", JSON.stringify(data)); // It's recommended to store objects as JSON strings.
};

export const getUserDataInStorage = (): string | null => JSON.parse(localStorage.getItem("user")!);

export const removeUserDataFromStorage = (): void => {
  localStorage.removeItem("user");
};

export const clearStorage = (): void => {
  localStorage.clear();
}