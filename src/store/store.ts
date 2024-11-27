import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/user/userSlice";
import consigneeSlice from "../features/consignee/consigneeSlice";
import shipperSlice from "../features/shipper/shipperSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    consignee: consigneeSlice,
    shipper: shipperSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
