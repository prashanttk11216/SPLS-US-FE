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

const BrokerUserList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [brokerUserData, setBrokerUserData] = useState<Partial<User> | null>(
    null
  );
  const [brokerUsers, setBrokerUsers] = useState<User[]>([]);

  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const storedItemsPerPage = localStorage.getItem("itemsPerPage");
    return storedItemsPerPage ? Number(storedItemsPerPage) : 10;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

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
      let query = `?role=${UserRole.BROKER_USER}&page=${currentPage}&limit=${itemsPerPage}`;
      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }
      const result = await fetchBrokerUsers(query);
      if (result.success) {
        setBrokerUsers(result.data as User[]);
      } else {
        toast.error(result.message || "Failed to fetch Broker Users.");
      }
    } catch (err) {
      toast.error("Error fetching Broker data.");
    }
  }, [fetchBrokerUsers, user, currentPage, itemsPerPage]);

  useEffect(() => {
    if (user && user._id) {
      fetchBrokerUsersData();
    }
  }, [fetchBrokerUsersData, user]);

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
    // console.log("Selected itemsPerPage:", newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", newItemsPerPage.toString()); // Reset to the first page when items per page changes
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    console.log(`Fetching items from ${startIndex} to ${endIndex}`);
    return brokerUsers.slice(startIndex, endIndex);
  };

  const getRowData = () => {
    return getPaginatedData().map((broker) => ({
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
      actions: getActionsForBroker(broker),
    }));
  };

  useEffect(() => {
    const totalPages = Math.ceil(brokerUsers.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1)); // Ensure valid page
    }
  }, [brokerUsers, currentPage, itemsPerPage]);

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
              totalItems={brokerUsers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
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
