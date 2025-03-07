import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role } from "../../types/User";

const initialState: Role[] = []

export const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setRoles: (_, action: PayloadAction<Role[]>) => {
      return action.payload; // ✅ Update roles correctly
    },
    resetRoles: () => {
      return initialState
    },
  },
});

// Action creators
export const { setRoles, resetRoles } = rolesSlice.actions;

// Correct reducer export
export default rolesSlice.reducer;
