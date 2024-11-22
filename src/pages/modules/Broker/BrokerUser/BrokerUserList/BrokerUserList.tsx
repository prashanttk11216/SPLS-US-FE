import React, { useState, useEffect, useCallback } from "react";
import Avatar from "../../../../../components/common/Avatar/Avatar";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import {
  deleteUser,
  getUserById,
  getUsers,
  toggleActiveStatus,
} from "../../../../../services/user/userService";
import { toast } from "react-toastify";
import { UserRole } from "../../../../../enums/UserRole";
import { User } from "../../../../../types/User";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import "./BrokerUserList.scss";
import CreateOrEditBrokerUser from "../CreateOrEditBrokerUser/CreateOrEditBrokerUser";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination from "../../../../../components/common/Pagination/Pagination";
import FilterShape from "../../../../../assets/icons/Filter.svg";
import closeLogo from "../../../../../assets/icons/closeLogo.svg";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";

const BrokerUserList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [brokerUserData, setBrokerUserData] = useState<Partial<User> | null>(
    null
  );
  const [brokerUsers, setBrokerUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All"); // state for filter

  // Default items per page set to 10
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [sortFilter, setSortFilter] = useState<string>("default"); // state for sorting filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSortFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSortFilter(event.target.value);
  };

  const {
    fetchData: fetchBrokerUsers,
    deleteDataById: deleteBrokerUser,
    updateData: updateStatus,
    loading,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    deleteDataService: deleteUser,
    updateDataService: toggleActiveStatus,
  });

  const fetchBrokerUsersData = useCallback(async () => {
    if (!user || !user._id) return;
    try {
      let query = `?role=${UserRole.BROKER_USER}&page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`;
      // Append `isActive` filter based on `statusFilter`
      if (statusFilter === "Active") {
        query += `&isActive=true`;
      } else if (statusFilter === "Inactive") {
        query += `&isActive=false`;
      }

      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }
      const result = await fetchBrokerUsers(query);
      if (result.success) {
        let sortedData = result.data as User[];

        // Apply sorting based on `sortFilter`
        sortedData = sortedData.sort((a: User, b: User) => {
          switch (sortFilter) {
            case "firstName":
              return a.firstName.localeCompare(b.firstName);
            case "lastName":
              return a.lastName.localeCompare(b.lastName);
            case "dueDate":
              return (
                new Date(a.dueDate || 0).getTime() -
                new Date(b.dueDate || 0).getTime()
              );
            case "lastLogin":
              return (
                new Date(b.lastLogin || 0).getTime() -
                new Date(a.lastLogin || 0).getTime()
              );
            default:
              return 0; // No sorting for "default"
          }
        });

        // setCustomers(result.data as User[]);
        setBrokerUsers(sortedData);
        setTotalItems(result.meta.totalItems);
      } else {
        toast.error(result.message || "Failed to fetch Broker Users.");
      }
    } catch (err) {
      toast.error("Error fetching Broker data.");
    }
  }, [
    fetchBrokerUsers,
    user,
    currentPage,
    itemsPerPage,
    statusFilter,
    sortFilter,
    searchQuery,
  ]);

  useEffect(() => {
    if (user && user._id) {
      fetchBrokerUsersData();
    }
  }, [
    fetchBrokerUsersData,
    user,
    currentPage,
    itemsPerPage,
    statusFilter,
    searchQuery,
  ]);

  const openCreateModal = () => {
    setIsEditing(false);
    setBrokerUserData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (data: Partial<User>) => {
    setIsEditing(true);
    setBrokerUserData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBrokerUserData(null);
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "Edit":
        try {
          const brokerData = await getUserById(row._id);
          openEditModal(brokerData.data);
        } catch {
          toast.error("Failed to fetch user details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deleteBrokerUser(row._id);
          if (result.success) {
            toast.success(result.message);
            fetchBrokerUsersData();
          }
        } catch {
          toast.error("Failed to delete user.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateStatus(row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchBrokerUsersData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} user.`);
        }
        break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const getActionsForBroker = (broker: User): string[] => {
    const actions = ["Edit"];
    if (broker.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Delete");
    return actions;
  };

  const columns = [
    { key: "name", label: "Name", width: "30%" },
    { key: "employeeId", label: "Employee ID" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const getRowData = () => {
    return brokerUsers
      .filter((broker) => {
        if (statusFilter === "All") return true;
        return broker.isActive === (statusFilter === "Active");
      })
      .map((broker) => ({
        _id: broker._id,
        name: (
          <div className="d-flex align-items-center">
            <div className="avatar_wrapper me-2">
              <Avatar
                avatarUrl={broker.avatarUrl}
                firstName={broker.firstName}
                lastName={broker.lastName}
                email={broker.email}
                size={35}
              />
            </div>
            <div className="name">{`${broker.firstName} ${broker.lastName}`}</div>
          </div>
      ),
      employeeId: broker.employeeId,
      email: broker.email,
      contact: broker.primaryNumber || "N/A",
      company: broker.company || "N/A",
      status: broker.isActive ? "Active" : "Inactive",
      actions: getActionsForBroker(broker),
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [totalItems, currentPage, itemsPerPage]);

  const handleCloseDropdown = () => {
    const dropdownMenu = document.getElementById("filterList");
    dropdownMenu.classList.remove("show"); // This will close the dropdown
  };

  const handleSearch = (query: string) => {
    console.log("Debounced search query:", query);
    setSearchQuery(query);
    // Trigger API call or filtering logic here
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">Broker Users</h2>
      <div className="d-flex align-items-center my-3">
        <div className="status-filter-radio-group" id="ActiveInactiveradio">
          <label>
            All
            <input
              type="radio"
              name="statusFilter"
              value="All"
              checked={statusFilter === "All"}
              onChange={() => setStatusFilter("All")}
            />
          </label>
          <label>
            Active
            <input
              type="radio"
              name="statusFilter"
              value="Active"
              checked={statusFilter === "Active"}
              onChange={() => setStatusFilter("Active")}
            />
          </label>
          <label>
            Inactive
            <input
              type="radio"
              name="statusFilter"
              value="Inactive"
              checked={statusFilter === "Inactive"}
              onChange={() => setStatusFilter("Inactive")}
            />
          </label>
        </div>

        {/* Filter Dropdown */}
        <div className="dropdown ms-3">
          <button
            className="btn btn-outline-primary dropdown-toggle"
            type="button"
            id="sortDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img src={FilterShape} alt="FilterShape" height={20} width={20} />
            <span
              style={{
                fontSize: "17px",
                margin: "6px",
                lineHeight: "16.94px",
              }}
            >
              Filter
            </span>
            {/* Filter: {sortFilter === "default" ? "Default" : sortFilter} */}
          </button>
          <ul
            className="dropdown-menu mt-3"
            aria-labelledby="sortDropdown"
            id="filterList"
            style={{ width: "224px" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span
                style={{
                  marginLeft: "10px",
                  marginTop: "10px",
                  fontWeight: "600",
                }}
              >
                Sort by:
              </span>
              <img
                src={closeLogo}
                alt="Close"
                onClick={handleCloseDropdown}
                style={{
                  width: "11px",
                  height: "13px",
                  marginRight: "8px",
                  marginTop: "-15px",
                  cursor: "pointer",
                }}
              />
            </div>
            <li>
              <label className="filter-label d-flex align-items-center w-100">
                <span className="filter-text">Default</span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="default"
                  checked={sortFilter === "default"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4"
                />
              </label>
            </li>
            <li>
              <label className="filter-label d-flex align-items-center w-100">
                <span className="filter-text">First Name</span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="firstName"
                  checked={sortFilter === "firstName"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4"
                />
              </label>
            </li>
            <li>
              <label className="filter-label d-flex align-items-center w-100">
                <span className="filter-text">Last Name</span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="lastName"
                  checked={sortFilter === "lastName"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4"
                />
              </label>
            </li>
            <li>
              <label className="filter-label d-flex align-items-center w-100">
                <span>Due Date</span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="dueDate"
                  checked={sortFilter === "dueDate"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4"
                />
              </label>
            </li>
            <li>
              <label className="filter-label d-flex align-items-center w-100">
                <span className="filter-text">Last Login</span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="lastLogin"
                  checked={sortFilter === "lastLogin"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4"
                />
              </label>
            </li>
          </ul>
        </div>

        {/* Search Bar */}
        <div className="searchbar-container ms-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        <button
          className="btn btn-accent d-flex align-items-center ms-auto"
          type="button"
          onClick={openCreateModal}
        >
          <img src={PlusIcon} height={16} width={16} className="me-2" />
          Create
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <Table
            columns={columns}
            rows={getRowData()}
            data={brokerUsers}
            onActionClick={handleAction}
          />
          <div className="pagination-container">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      <CreateOrEditBrokerUser
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchBrokerUsersData();
        }}
        isEditing={isEditing}
        brokerUserData={brokerUserData}
      />
    </div>
  );
};

export default BrokerUserList;
