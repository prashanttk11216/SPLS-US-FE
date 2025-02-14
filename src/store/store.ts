import { configureStore } from '@reduxjs/toolkit'
import userSlice  from '../features/user/userSlice'
import rolesSlice  from '../features/roles/rolesSlice'

export const store = configureStore({
  reducer: {
    user: userSlice,
    roles: rolesSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch