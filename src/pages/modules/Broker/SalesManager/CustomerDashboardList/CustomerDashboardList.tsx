import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
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
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  PaginationState,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";
import { hasAccess } from "../../../../../utils/permissions";

export enum CustomerStatus {
    Active = "Active",
    Inactive = "Inactive"
}

const CustomerDashboardList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [customers, setCustomers] = useState<User[]>([]);
  const savedActiveTab = localStorage.getItem("customerActiveTab");
  const [activeTab, setActiveTab] = useState<CustomerStatus>(
      savedActiveTab
        ? (savedActiveTab as CustomerStatus)
        : CustomerStatus.Active
    );
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("email");

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const { getData, getDataById, updateData, deleteData, loading, error } = useFetchData<any>({
    getAll: { 
      user: getUsers,
     },
     getById: {
      user: getUserById
     },
     update: {
      user: toggleActiveStatus,
     },
     remove: {
      user: deleteUser,
     }
  });

  // Fetch customers data
  const fetchCustomersData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?role=${UserRole.CUSTOMER}&page=${page}&limit=${limit}&isActive=${activeTab == CustomerStatus.Active ? true : false}`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }

        if (hasAccess(user.roles, { roles: [UserRole.BROKER_USER]})) {
          query += `&brokerId=${user._id}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }
        const result = await getData("user", query);
        if (result.success) {
          const userData = result.data as User[];

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
    [getData, searchQuery,activeTab, user, sortConfig]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchCustomersData();
    }
  }, [user, searchQuery,activeTab, sortConfig]);

   // Update active tab in localStorage whenever it changes
    useEffect(() => {
      localStorage.setItem("customerActiveTab", activeTab);
    }, [activeTab]);

  const columns = [
    { width: "150px", key: "company", label: "Company", sortable: true },
    { width: "150px", key: "address", label: "Contact", sortable: true },
    { width: "150px", key: "contact", label: "Phone", sortable: true },
    { width: "90px", key: "isActive", label: "Status", sortable: true },
    // { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const handleSort = (
    sortStr: { key: string; direction: "asc" | "desc" } | null
  ) => {
    setSortConfig(sortStr); // Updates the sort query to trigger API call
  };

  const getActionsForCustomer = (broker: User): string[] => {
    const actions = [];
    if (broker.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchCustomersData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchCustomersData(1, limit);
  };

  const getRowData = () => {
    return customers.map((customer) => ({
      _id: customer._id,
      company: customer.company || "N/A",
      address: customer.address?.str || "N/A",
      contact: customer.primaryNumber
        ? formatPhoneNumber(customer.primaryNumber)
        : "N/A",
      isActive: customer.isActive ? "Active" : "Inactive",
    //   actions: getActionsForCustomer(customer),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="customers-list-wrapper">
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">Customer Dashboard</h2>
      </div>
      <div className="d-flex align-items-center my-3">
        {/* Search Bar */}
        <div className="searchbar-container">
          <SearchBar
            onSearch={handleSearch}
            searchFieldOptions={[
              { label: "Email", value: "email" },
              { label: "Name", value: "name" },
              { label: "Company", value: "company" },
              { label: "Contact", value: "primaryNumber" },
            ]}
            defaultField={searchField}
            onSearchFieldChange={(value) => setSearchField(value.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <>
        <ul className="nav nav-tabs">
                      <li
                        className="nav-item"
                        onClick={() => setActiveTab(CustomerStatus.Active)}
                      >
                        <a
                          className={`nav-link ${
                            CustomerStatus.Active == activeTab && "active"
                          }`}
                          aria-current="page"
                          href="#"
                        >
                          Customers
                        </a>
                      </li>
                      <li
                        className="nav-item"
                        onClick={() => setActiveTab(CustomerStatus.Inactive)}
                      >
                        <a
                          className={`nav-link ${
                            CustomerStatus.Inactive == activeTab && "active"
                          }`}
                          href="#"
                        >
                          Inactive
                        </a>
                      </li>
                    </ul>
          <Table
            columns={columns}
            rows={getRowData()}
            data={customers}
            onActionClick={handleAction}
            rowClickable={true}
            onSort={handleSort}
            sortConfig={sortConfig}
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
    </div>
  );
};

export default CustomerDashboardList;
