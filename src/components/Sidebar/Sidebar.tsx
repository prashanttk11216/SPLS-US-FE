import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ArrowDownIcon from "../../assets/icons/arrowDown.svg";
import ArrowUpIcon from "../../assets/icons/arrowUp.svg";
import "./Sidebar.scss";

// Define the structure for menu items
interface MenuItem {
  name: string;
  icon?: string;
  path: string;
  subMenu?: { name: string; path: string; icon?: string }[];
}

interface SidebarProps {
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const location = useLocation();

  // State to track open submenus
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  // Function to toggle a submenu
  const toggleSubMenu = (path: string) => {
    setOpenSubMenus((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
    );
  };

  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => {
          // Check if the current URL matches the main item or any of its submenus
          const isActiveMain = location.pathname === item.path;
          const isActiveSubMenu = item.subMenu?.some(
            (subItem) => subItem.path === location.pathname
          );
          const isMenuOpen = openSubMenus.includes(item.path);

          return (
            <li
              key={index}
              className={`menu-item ${isActiveMain || isActiveSubMenu ? "active" : ""}`}
            >
              <div
                className="menu-item-main"
                onClick={() => item.subMenu && toggleSubMenu(item.path)}
              >
                <Link
                  to={item.path}
                  className={`text-decoration-none w-100 ${isActiveMain ? "active-main" : ""}`}
                >
                  {item.icon && <img src={item.icon} alt={`${item.name} icon`} />}
                  <span>{item.name}</span>
                </Link>
                {item.subMenu && isMenuOpen && (
                  <span className={`submenu-icon`}>
                    <img src={ArrowDownIcon} alt="Arrow down" />
                  </span>
                )}
                 {item.subMenu && !isMenuOpen && (
                  <span className={`submenu-icon`}>
                    <img src={ArrowUpIcon} alt="Arrow down" />
                  </span>
                )}
              </div>
              {item.subMenu && isMenuOpen && (
                <ul className="submenu">
                  {item.subMenu.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`submenu-item ${
                        location.pathname === subItem.path ? "active-submenu" : ""
                      }`}
                    >
                      <Link
                        to={subItem.path}
                        className={`text-decoration-none w-100 ${
                          location.pathname === subItem.path ? "active-submenu" : ""
                        }`}
                      >
                        {subItem.icon && (
                          <img src={subItem.icon} alt={`${subItem.name} icon`} />
                        )}
                        <span>{subItem.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
