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
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import "./BrokerUserList.scss";
import CreateOrEditBrokerUser from "../CreateOrEditBrokerUser/CreateOrEditBrokerUser";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";

const BrokerUserList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [brokerUserData, setBrokerUserData] = useState<Partial<User> | null>(
    null
  ); // Use specific state for editing data
  const [brokerUsers, setBrokerUsers] = useState<User[]>([]);

  const {
    fetchData: fetchBrokerUsers,
    fetchDataById: fetchBrokerUser,
    deleteDataById: deleteBrokerUser,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    fetchByIdService: getUserById,
    deleteDataService: deleteUser,
  });

  // Fetch Broker User data
  const fetchBrokerUsersData = useCallback(async () => {
    if (!user || !user._id) return; // Wait for user data
    try {
      let query = `?role=${UserRole.BROKER_USER}`;
      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }
      const result = await fetchBrokerUsers(query);
      if (result.success) {
        setBrokerUsers(result.data);
      } else {
        toast.error(result.message || "Failed to fetch Broker Users.");
      }
    } catch (err) {
      toast.error("Error fetching Broker data.");
    }
  }, [fetchBrokerUsers, user]);

  // Use a single fetch on initial render
  useEffect(() => {
    if (user && user._id) {
      fetchBrokerUsersData();
    }
  }, [fetchBrokerUsersData, user]);

  const columns = [
    { key: "name", label: "Name", width: "30%" },
    { key: "employeeId", label: "Employee ID" },
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
        const customerData = await fetchBrokerUser(row._id);
        openEditModal(customerData.data);
      } catch (err) {
        toast.error("Failed to fetch customer details for editing.");
      }
    }
    if (action === "Delete") {
      try {
        const result = await deleteBrokerUser(row._id);
        if (result.success) {
          toast.success(result.message);
          fetchBrokerUsersData();
        }
      } catch (err) {
        toast.error("Failed to delete customer.");
      }
    }
  };

  const getRowData = () => {
    return brokerUsers.map((broker) => ({
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
      contact: broker.contactNumber || "N/A",
      company: broker.company || "N/A",
      status: broker.isActive ? "Active" : "Inactive",
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setBrokerUserData(null); // Reset form data for create
    setIsModalOpen(true);
  };

  const openEditModal = (data: Partial<User>) => {
    setIsEditing(true);
    setBrokerUserData(data); // Set data for edit
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBrokerUserData(null); // Clear form data on modal close
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">Broker Users</h2>
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
          data={brokerUsers}
          actions={["Edit", "Delete"]}
          onActionClick={handleActionClick}
        />
      )}

      <CreateOrEditBrokerUser
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchBrokerUsersData(); // Refresh customers after modal close
        }}
        isEditing={isEditing}
        brokerUserData={brokerUserData}
      />
    </div>
  );
};

export default BrokerUserList;
