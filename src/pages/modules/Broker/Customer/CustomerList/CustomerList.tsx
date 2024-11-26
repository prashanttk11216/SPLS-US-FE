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
import CreateOrEditCustomer from "../CreateOrEditCustomer/CreateOrEditCustomer";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import FilterShape from "../../../../../assets/icons/Filter.svg";
import closeLogo from "../../../../../assets/icons/closeLogo.svg";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./CustomerList.scss";

const CustomerList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customerToEdit, setCustomerToEdit] = useState<Partial<User> | null>(
    null
  );
  const [customers, setCustomers] = useState<User[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Inactive" | null
  >(null); // state for filter
  const [sortFilter, setSortFilter] = useState<string | null>(null); // state for sorting filter
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sort order state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSortFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSortFilter(event.target.value);
  };

  const {
    fetchData: fetchCustomers,
    fetchDataById: fetchCustomer,
    deleteDataById: deleteCustomer,
    updateData: updateStatus,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    fetchByIdService: getUserById,
    deleteDataService: deleteUser,
    updateDataService: toggleActiveStatus,
  });

  // Fetch customers data
  const fetchCustomersData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?role=${UserRole.CUSTOMER}&page=${page}&limit=${limit}`;

        //Search Functionality
        if (searchQuery) {
          query += `&search=${encodeURIComponent(searchQuery)}`;
        }

        // Append `isActive` filter based on `statusFilter`
        if (statusFilter === "Active") {
          query += `&isActive=true`;
        } else if (statusFilter === "Inactive") {
          query += `&isActive=false`;
        }

        if (user.role === UserRole.BROKER_USER) {
          query += `&brokerId=${user._id}`;
        }

        if (sortFilter) {
          query += `&sortBy=${sortFilter}&sortOrder=${sortOrder}`;
        }

        const result = await fetchCustomers(query);
        if (result.success) {
          let userData = result.data as User[];

          // setCustomers(result.data as User[]);
          setCustomers(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch customers.");
        }
      } catch (err) {
        toast.error("Error fetching customer data.");
      }
    },
    [fetchCustomers, statusFilter, sortOrder, searchQuery, user]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchCustomersData();
    }
  }, [user, statusFilter, sortFilter, sortOrder, searchQuery]);

  const columns = [
    { key: "name", label: "Name", width: "40%" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "Edit":
        try {
          const customerData = await fetchCustomer(row._id);
          openEditModal(customerData.data);
        } catch (err) {
          toast.error("Failed to fetch customer details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deleteCustomer(row._id);
          if (result.success) {
            toast.success(result.message);
            fetchCustomersData();
          }
        } catch (err) {
          toast.error("Failed to delete customer.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateStatus(row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchCustomersData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} user.`);
        }
        break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const getActionsForCustomer = (broker: User): string[] => {
    const actions = ["Edit"];
    if (broker.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Delete");
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchCustomersData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchCustomersData(1, limit);
  };

  const handleSortClick = (column: string) => {
    // If the clicked column is the same as the current column
    if (sortFilter === column) {
      // Toggle the sort order (ASC <-> DESC)
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      // If a new column is clicked, reset sort order to "asc" and update the filter
      setSortFilter(column);
      setSortOrder("asc");
    }
  };

  const getRowData = () => {
    return customers.map((customer) => ({
      _id: customer._id,
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar
              avatarUrl={customer.avatarUrl}
              firstName={customer.firstName}
              lastName={customer.lastName}
              email={customer.email}
              size={35}
            />
          </div>
          <div className="name">{`${customer.firstName} ${customer.lastName}`}</div>
        </div>
      ),
      email: customer.email,
      contact: customer.primaryNumber || "N/A",
      company: customer.company || "N/A",
      status: customer.isActive ? "Active" : "Inactive",
      actions: getActionsForCustomer(customer),
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customerData: Partial<User>) => {
    setIsEditing(true);
    setCustomerToEdit(customerData);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setCustomerToEdit(null); // Clear form data on modal close
  };

  const handleCloseDropdown = () => {
    const dropdownMenu = document.getElementById("filterList");
    dropdownMenu?.classList.remove("show"); // This will close the dropdown
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearAllFilters = () => {
    setStatusFilter(null);
    setSortFilter(null);
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">Customer Overview</h2>
      <div className="d-flex align-items-center my-3">
        {/* Filter Dropdown */}
        <div className="dropdown">
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
          </button>
          <ul
            className="dropdown-menu mt-3"
            aria-labelledby="sortDropdown"
            id="filterList"
            style={{ width: "224px" }}
          >
            <div className="d-flex justify-content-between align-items-center form-check">
              <span
                style={{
                  marginTop: "10px",
                  fontWeight: "600",
                }}
              >
                Filter by Status:
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
            {/* Active/Inactive Filters */}
            <li>
              <label className="filter-label d-flex align-items-center w-100 form-check">
                <span className="filter-text">Active</span>
                <input
                  type="radio"
                  name="statusFilter"
                  value="Active"
                  checked={statusFilter === "Active"}
                  onChange={() => setStatusFilter("Active")}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>
            <li>
              <label className="filter-label d-flex align-items-center w-100 form-check">
                <span className="filter-text">Inactive</span>
                <input
                  type="radio"
                  name="statusFilter"
                  value="Inactive"
                  checked={statusFilter === "Inactive"}
                  onChange={() => setStatusFilter("Inactive")}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>

            <div className="d-flex justify-content-between align-items-center form-check">
              <span
                style={{
                  marginTop: "10px",
                  fontWeight: "600",
                }}
              >
                Sort by:
              </span>
            </div>
            <li>
              <label className="filter-label d-flex align-items-center w-100 form-check">
                <span
                  className="filter-text"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSortClick("firstName");
                  }}
                >
                  First Name (
                  {sortFilter === "firstName" ? sortOrder.toUpperCase() : "ASC"}
                  )
                </span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="firstName"
                  checked={sortFilter === "firstName"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>
            <li>
              <label
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSortClick("lastName");
                }}
                className="filter-label d-flex align-items-center w-100 form-check"
              >
                <span className="filter-text">
                  Last Name (
                  {sortFilter === "lastName" ? sortOrder.toUpperCase() : "ASC"})
                </span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="lastName"
                  checked={sortFilter === "lastName"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>
            <div className="dropdown-divider"></div>
            {/* Clear Filter Button */}
            <li className="text-center mt-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
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
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={getRowData()}
            data={customers}
            onActionClick={handleAction}
          />
          <div className="pagination-container">
            {/* Pagination Component */}
            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      <CreateOrEditCustomer
        isModalOpen={isModalOpen}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchCustomersData(); // Refresh customers after modal close
        }}
        closeModal={closeModal}
        isEditing={isEditing}
        customerData={customerToEdit}
      />
    </div>
  );
};

export default CustomerList;
