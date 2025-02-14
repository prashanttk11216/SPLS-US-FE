import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { setUser } from "../../features/user/userSlice";
import { RootState } from "../../store/store";
import { getAuthTokenFromStorage, getUserDataInStorage } from "../../utils/authHelplers";
import { useEffect } from "react";
import useFetchData from "../../hooks/useFetchData/useFetchData";
import { getRoles } from "../../services/role/roleServices";
import { setRoles } from "../../features/roles/rolesSlice";
import { Role } from "../../types/User";

const ProtectedRoutes: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const token = getAuthTokenFromStorage(); // Retrieve token from local storage or cookies
  // const [isLoading, setIsLoading] = useState(true);

  const { getData } = useFetchData<any>({
    getAll: {
      role: getRoles
    }
  });

  const getRolesData = async () => {
    const result = await getData("role");
    if(result.success){
      dispatch(setRoles(result.data as Role[]));
    }
  }

  useEffect(() => {
    getRolesData();
  }, []);
  

  useEffect(() => {
    const initializeUser = () => {
      if (!user._id && token) {
        const storedUser:any = getUserDataInStorage();

        if (storedUser) {
          try {
            dispatch(setUser(storedUser));
          } catch (error) {
            console.error("Error parsing user data from local storage:", error);
            // Clear potentially corrupted data
            localStorage.removeItem("user");
          }
        }
      }
      // setIsLoading(false); // Indicate loading is complete
    };

    initializeUser();
  }, [dispatch, user._id, token]);

  // Redirect to login if no token is available
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Show loading state if the user data is still being initialized
  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoutes;
