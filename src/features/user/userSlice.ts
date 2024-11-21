import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/User";

const initialState: User = {
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  primaryNumber: '',
  employeeId: '',
  role: undefined,
  company: undefined,
  accessLevel: undefined,
  isVerified: false,
  isDeleted: false,
  createdAt: null,
  updatedAt: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state._id = action.payload._id;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.primaryNumber = action.payload.primaryNumber;
      state.role = action.payload.role ?? state.role;
      state.company = action.payload.company ?? state.company;
      state.accessLevel = action.payload.accessLevel ?? state.accessLevel;
      state.employeeId = action.payload.employeeId;
      state.isVerified = action.payload.isVerified ?? state.isVerified;
      state.isDeleted = action.payload.isDeleted ?? state.isDeleted;
      state.createdAt = action.payload.createdAt ?? state.createdAt;
      state.updatedAt = action.payload.updatedAt ?? state.updatedAt;
    },
    resetUser: () => initialState, // Just return initialState for resetUser
  },
});

// Action creators are generated for each case reducer function
export const { setUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
