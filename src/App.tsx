import { Provider } from "react-redux";
import { store } from "./store/store";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { routes } from "./router/AppRouter";
import "react-toastify/dist/ReactToastify.css";
import "react-international-phone/style.css";
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import "./App.scss";

function App() {
  return (
    <>
      <div className="app-wrapper">
        <Provider store={store}>
          <RouterProvider router={routes} />
          <ToastContainer
            position="top-right"
            autoClose={5000}
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
      </div>
    </>
  );
}

export default App;
