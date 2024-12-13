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
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./CustomerList.scss";
import CustomerDetailsModal from "../CustomerDetailsModal/CustomerDetailsModal";

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

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [customerDetails, setCustomerDetails] = useState<Partial<User> | null>(
    null
  );

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

        if (user.role === UserRole.BROKER_USER) {
          query += `&brokerId=${user._id}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
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
    [fetchCustomers, searchQuery, user, sortConfig]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchCustomersData();
    }
  }, [user, searchQuery, sortConfig]);

  const columns = [
    { width: "250px", key: "name", label: "Name" },
    { width: "210px", key: "email", label: "Email", sortable: true },
    { width: "150px", key: "contact", label: "Contact", sortable: true },
    { width: "150px", key: "company", label: "Company", sortable: true },
    { width: "90px", key: "status", label: "Status" },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;

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

  const handleRowClick = async (row: Record<string, any>) => {
    if (row) {
      openDetailsModal(row); // Open details modal
    }
  };

  const handleSort = (
    sortStr: { key: string; direction: "asc" | "desc" } | null
  ) => {
    setSortConfig(sortStr); // Updates the sort query to trigger API call
  };

  const getActionsForCustomer = (broker: User): string[] => {
    const actions = ["View Details", "Edit"];
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

  // View Details Option Added
  const openDetailsModal = (customerData: Partial<User>) => {
    setCustomerDetails(customerData);
    setIsDetailsModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">Customer Overview</h2>
      <div className="d-flex align-items-center my-3">

        {/* Search Bar */}
        <div className="searchbar-container">
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
            rowClickable={true}
            onSort={handleSort}
            sortConfig={sortConfig}
            onRowClick={handleRowClick}
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

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        customer={customerDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default CustomerList;
