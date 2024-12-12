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
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import BrokerDetailsModal from "../BrokerDetailsModal/BrokerDetailsModal";

const BrokerUserList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [brokerUserData, setBrokerUserData] = useState<Partial<User> | null>(
    null
  );
  const [brokerUsers, setBrokerUsers] = useState<User[]>([]);
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
  const [brokerDetails, setBrokerDetails] = useState<Partial<User> | null>(
    null
  );

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

  const fetchBrokerUsersData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?role=${UserRole.BROKER_USER}&page=${page}&limit=${limit}`;

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

        const result = await fetchBrokerUsers(query);
        if (result.success) {
          let userData = result.data as User[];

          // setCustomers(result.data as User[]);
          setBrokerUsers(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch Broker Users.");
        }
      } catch (err) {
        toast.error("Error fetching Broker data.");
      }
    },
    [fetchBrokerUsers, searchQuery, user, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchBrokerUsersData();
    }
  }, [user, searchQuery, sortConfig]);

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

  // View Details Option Added
  const openDetailsModal = (brokerData: Partial<User>) => {
    setBrokerDetails(brokerData);
    setIsDetailsModalOpen(true);
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;

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

  const getActionsForBroker = (broker: User): string[] => {
    const actions = ["View Details", "Edit"];
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
    { key: "employeeId", label: "Employee ID", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "contact", label: "Contact", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handlePageChange = (page: number) => {
    fetchBrokerUsersData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchBrokerUsersData(1, limit);
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
      contact: broker.primaryNumber || "N/A",
      company: broker.company || "N/A",
      status: broker.isActive ? "Active" : "Inactive",
      actions: getActionsForBroker(broker),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="broker-list-wrapper">
      <h2 className="fw-bolder">Broker Users</h2>
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
      ) : (
        <>
          <Table
            columns={columns}
            rows={getRowData()}
            data={brokerUsers}
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

      <BrokerDetailsModal
        isOpen={isDetailsModalOpen}
        broker={brokerDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default BrokerUserList;
