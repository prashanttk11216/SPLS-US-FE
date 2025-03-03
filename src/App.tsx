import { Provider } from "react-redux";
import { store } from "./store/store";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { routes } from "./router/AppRouter";
import { APIProvider } from "@vis.gl/react-google-maps";
import "react-toastify/dist/ReactToastify.css";
import "react-international-phone/style.css";
import "react-datepicker/dist/react-datepicker.css";
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import "./App.scss";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

function App() {
  return (
    <>
      <div className="app-wrapper">
       <APIProvider apiKey={API_KEY} solutionChannel='GMP_devsite_samples_v3_rgmautocomplete'>
        <Provider store={store}>
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
    </>
  );
}

export default App;
