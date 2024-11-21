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
import "./CustomerList.scss";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination from "../../../../../components/common/Pagination/Pagination";

const CustomerList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customerToEdit, setCustomerToEdit] = useState<Partial<User> | null>(
    null
  );
  const [customers, setCustomers] = useState<User[]>([]);

  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const storedItemsPerPage = localStorage.getItem("itemsPerPage");
    return storedItemsPerPage ? Number(storedItemsPerPage) : 10;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

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
  const fetchCustomersData = useCallback(async () => {
    if (!user || !user._id) return; // Wait for user data
    try {
      let query = `?role=${UserRole.CUSTOMER}&page=${currentPage}&limit=${itemsPerPage}`;
      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }

      const result = await fetchCustomers(query);
      if (result.success) {
        setCustomers(result.data as User[]);
      } else {
        toast.error(result.message || "Failed to fetch customers.");
      }
    } catch (err) {
      toast.error("Error fetching customer data.");
    }
  }, [fetchCustomers, user, currentPage, itemsPerPage]);

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchCustomersData();
    }
  }, [fetchCustomersData, user]);

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

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    // console.log("Selected itemsPerPage:", newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", newItemsPerPage.toString()); // Reset to the first page when items per page changes
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    // console.log(`Fetching items from ${startIndex} to ${endIndex}`);
    return customers.slice(startIndex, endIndex);
  };

  const getRowData = () => {
    return getPaginatedData().map((customer) => ({
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
      contact: customer.contactNumber || "N/A",
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

  useEffect(() => {
    const totalPages = Math.ceil(customers.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1)); // Ensure valid page
    }
  }, [customers, currentPage, itemsPerPage]);

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">Customers</h2>
      <div className="d-flex align-items-center my-3">
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
            <Pagination
              totalItems={customers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
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
        isEditing={isEditing}
        customerData={customerToEdit}
      />
    </div>
  );
};

export default CustomerList;
