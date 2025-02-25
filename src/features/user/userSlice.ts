import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/User";

const initialState: User = {
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  primaryNumber: '',
  employeeId: '',
  roles: [],
  company: undefined,
  avatarUrl: '',
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
      state.roles = action.payload.roles ?? state.roles;
      state.company = action.payload.company ?? state.company;
      state.avatarUrl = action.payload.avatarUrl ?? state.avatarUrl;
      state.employeeId = action.payload.employeeId;
      state.brokerId = action.payload.brokerId ?? state.brokerId;
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
