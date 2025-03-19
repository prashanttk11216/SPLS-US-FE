import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { routes } from "./router/AppRouter";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useCallback, useEffect } from "react";
import useFetchData from "./hooks/useFetchData/useFetchData.js";
import { getRoles } from "./services/role/roleServices.js";
import { Role } from "./types/User.js";
import { setRoles } from "./features/roles/rolesSlice.js";

import "react-toastify/dist/ReactToastify.css";
import "react-international-phone/style.css";
import "react-datepicker/dist/react-datepicker.css";
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import "./App.scss";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

const App = () => {
  return (
    <div className="app-wrapper">
      <APIProvider
        apiKey={API_KEY}
        solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
      >
        <Provider store={store}>
          <RoleFetcher />
          <RouterProvider router={routes} />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Provider>
      </APIProvider>
    </div>
  );
};

export default App;

const RoleFetcher = () => {
  const dispatch = useDispatch();
  const { getData } = useFetchData<any>({
    getAll: { role: getRoles },
  });

  // Use useCallback to prevent recreation of fetchRoles on each render
  const fetchRoles = useCallback(async () => {
    const result = await getData("role");
    if (result?.success) {
      dispatch(setRoles(result.data as Role[]));
    }
  }, [dispatch]); // `getData` is not included to avoid infinite re-fetching

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]); // Depend only on fetchRoles

  return null;
};