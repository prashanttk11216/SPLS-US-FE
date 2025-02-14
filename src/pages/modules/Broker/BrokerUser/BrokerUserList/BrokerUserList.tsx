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
import ChangePassowrd from "../../../../Auth/ChangePassword/ChangePassword";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";
import { hasAccess } from "../../../../../utils/permissions";
import { CreateUserForm } from "../../../../Auth/Signup/Signup";

const BrokerUserList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [brokerUserData, setBrokerUserData] = useState<Partial<CreateUserForm> | null>(
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
   const [searchField, setSearchField] = useState<string>("email");

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [brokerDetails, setBrokerDetails] = useState<Partial<User> | null>(
    null
  );
  const [changePasswordModel, setchangePasswordModel] = useState(false);


  const { getData,getDataById, updateData, deleteData, loading } = useFetchData<any>({
    getAll: { 
      user: getUsers,
     },
     getById: {
      user: getUserById,
     },
     update: {
      user: toggleActiveStatus,
     },
     remove: {
      user: deleteUser,
     }
  });

  const fetchBrokerUsersData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?role=${UserRole.BROKER_USER}&page=${page}&limit=${limit}`;

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

        const result = await getData("user",query);
        if (result.success) {
          const userData = result.data as User[];

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
    [getData, searchQuery, user, sortConfig]
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

  const openEditModal = (data: Partial<CreateUserForm>) => {
    setIsEditing(true);
    setBrokerUserData(data);
    setIsModalOpen(true);
  };

  const closeModal = (refresh: boolean = false) => {
    setIsModalOpen(false);
    setBrokerUserData(null);
    if (refresh) fetchBrokerUsersData();
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
          const brokerData = await getDataById("user",row._id);
          openEditModal(brokerData.data);
        } catch {
          toast.error("Failed to fetch user details for editing.");
        }
        break;
      case "Change Password":
        setBrokerDetails(row);
        setchangePasswordModel(true);
        break;
      case "Delete":
        try {
          const result = await deleteData("user",row._id);
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
          const result = await updateData("user",row._id, {});
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
    actions.push("Change Password");
    actions.push("Delete");
    return actions;
  };

  const columns = [
    { width: "250px", key: "name", label: "Name" },
    { width: "210px", key: "employeeId", label: "Employee ID", sortable: true },
    { width: "210px", key: "email", label: "Email", sortable: true },
    { width: "150px", key: "contact", label: "Contact", sortable: true },
    { width: "150px", key: "company", label: "Company", sortable: true },
    { width: "90px", key: "isActive", label: "Status",sortable: true },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
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
      contact: broker.primaryNumber
        ? formatPhoneNumber(broker.primaryNumber)
        : "N/A",
      company: broker.company || "N/A",
      isActive: broker.isActive ? "Active" : "Inactive",
      actions: getActionsForBroker(broker),
    }));
  };

  // Search Bar Functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="broker-list-wrapper">
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">Broker Users</h2>
        <button
            className="btn btn-accent d-flex align-items-center ms-auto"
            type="button"
            onClick={openCreateModal}
          >
            <img src={PlusIcon} height={16} width={16} className="me-2" />
            Create
          </button>
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
              { label: "Employee ID", value: "employeeId" },
            ]}
            defaultField={searchField}
            onSearchFieldChange={(value) => setSearchField(value.value)}
          />
        </div>
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
          {/* Pagination Component */}
          <div className="pagination-container">
            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      {isModalOpen && (
        <CreateOrEditBrokerUser
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          isEditing={isEditing}
          brokerUserData={brokerUserData}
        />
      )}

      {isDetailsModalOpen && (
        <BrokerDetailsModal
          isOpen={isDetailsModalOpen}
          broker={brokerDetails}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

      {changePasswordModel && (
        <ChangePassowrd
          email={brokerDetails?.email!}
          isModalOpen={changePasswordModel}
          closeModal={() => {
            setchangePasswordModel(false);
            setBrokerDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default BrokerUserList;
