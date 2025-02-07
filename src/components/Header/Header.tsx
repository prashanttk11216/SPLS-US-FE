import Logo from "../../assets/images/Logo.svg";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar/Avatar";
import User from "../../assets/icons/user.svg";
import SignOutIcon from "../../assets/icons/signOut.svg";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { clearStorage } from "../../utils/authHelplers";
import { resetUser } from "../../features/user/userSlice";
import { UserRole } from "../../enums/UserRole";
import "./Header.scss";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = (role: UserRole) => {
    clearStorage();
    dispatch(resetUser());
    const url = role == UserRole.BROKER_USER ? "/login?role=broker" : "/login";
    navigate(url);
  };
  return (
    <>
      <div className="header-wrapper bg-white d-flex align-items-center">
        <div className="logo-wrapper align-self-center">
          <Link className="text-decoration-none" to="/">
            {" "}
            <img src={Logo} />
          </Link>
        </div>
        <div className="profile-wrapper ms-auto d-flex align-items-center">
          <div className="dropdown">
            <a
              className="text-decoration-none d-flex align-items-center"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              data-bs-offset="15,27"
            >
              <Avatar
                avatarUrl={user.avatarUrl ? `${import.meta.env.VITE_SERVER_URL}/${user.avatarUrl}` : ""}
                firstName={user.firstName}
                lastName={user.lastName}
                email={user.email}
                size={36}
              />
              <div className="fw-bolder ms-2">
                {user.firstName} {user.lastName}
              </div>
            </a>
            <ul className="dropdown-menu profile-menu">
              <li>
                <Link
                  to="profile"
                  className="dropdown-item d-flex align-items-center"
                >
                  <span className="me-3">
                    <img src={User} />
                  </span>{" "}
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a
                  className="dropdown-item d-flex align-items-center"
                  role="button"
                  onClick={() => logout(user.role!)}
                >
                  <span className="me-3">
                    <img src={SignOutIcon} />
                  </span>{" "}
                  <span className="fw-bolder">Sign Out</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
