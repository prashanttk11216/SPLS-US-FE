import React, { useState, useEffect, useCallback } from "react";
import Avatar from "../../../../../components/common/Avatar/Avatar";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import {
  deleteUser,
  getUserById,
  getUsers,
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

const CustomerList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customerToEdit, setCustomerToEdit] = useState<Partial<User> | null>(
    null
  );
  const [customers, setCustomers] = useState<User[]>([]);

  const {
    fetchData: fetchCustomers,
    fetchDataById: fetchCustomer,
    deleteDataById: deleteCustomer,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    fetchByIdService: getUserById,
    deleteDataService: deleteUser,
  });

  // Fetch customers data
  const fetchCustomersData = useCallback(async () => {
    if (!user || !user._id) return; // Wait for user data
    try {
      let query = `?role=${UserRole.CUSTOMER}`;
      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }

      const result = await fetchCustomers(query);
      if (result.success) {
        setCustomers(result.data);
      } else {
        toast.error(result.message || "Failed to fetch customers.");
      }
    } catch (err) {
      toast.error("Error fetching customer data.");
    }
  }, [fetchCustomers, user]);

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

  const handleActionClick = async (
    action: string,
    row: Record<string, any>
  ) => {
    if (action === "Edit") {
      try {
        const customerData = await fetchCustomer(row._id);
        openEditModal(customerData.data);
      } catch (err) {
        toast.error("Failed to fetch customer details for editing.");
      }
    }
    if (action === "Delete") {
      try {
        const result = await deleteCustomer(row._id);
        if (result.success) {
          toast.success(result.message);
          fetchCustomersData();
        }
      } catch (err) {
        toast.error("Failed to delete customer.");
      }
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
      contact: customer.contactNumber || "N/A",
      company: customer.company || "N/A",
      status: customer.isActive ? "Active" : "Inactive",
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
        <Table
          columns={columns}
          rows={getRowData()}
          data={customers}
          actions={["Edit", "Delete"]}
          onActionClick={handleActionClick}
        />
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
