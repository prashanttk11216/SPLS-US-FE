import React, { useCallback, useEffect, useState } from "react";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import Loading from "../../../../../components/common/Loading/Loading";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import {
  deleteUser,
  getUserById,
  getUsers,
  toggleActiveStatus,
} from "../../../../../services/user/userService";
import Avatar from "../../../../../components/common/Avatar/Avatar";
import { User } from "../../../../../types/User";
import Table from "../../../../../components/common/Table/Table";
import CreateOrEditCarrier from "../CreateOrEditCarrier/CreateOrEditCarrier";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  PaginationState,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./CarrierList.scss";
import CarrierDetailsModal from "../CarrierDetailsModal/CarrierDetailsModal";
import ChangePassowrd from "../../../../Auth/ChangePassword/ChangePassword";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";
import { hasAccess } from "../../../../../utils/permissions";
import { CreateUserForm } from "../../../../Auth/Signup/Signup";

const CarrierList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [carrierToEdit, setCarrierToEdit] = useState<Partial<CreateUserForm> | null>(
    null
  );
  const [carriers, setCarriers] = useState<User[]>([]);

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
  const [carrierDetails, setCarrierDetails] = useState<Partial<User> | null>(
    null
  );
  const [changePasswordModel, setchangePasswordModel] = useState(false);


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

  // Fetch Carrier data
  const fetchCarrierData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?role=${UserRole.CARRIER}&page=${page}&limit=${limit}`;

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
          setCarriers(userData);
          setMeta(result.meta as PaginationState);
        } else {
          toast.error(result.message || "Failed to fetch carriers.");
        }
      } catch (err) {
        toast.error("Error fetching carrier data.");
      }
    },
    [getData, searchQuery, user, sortConfig]
  );

  // Use a single fetch on initial render and when currentPage, itemsPerPage, or user changes
  useEffect(() => {
    if (user && user._id) {
      fetchCarrierData();
    }
  }, [user, searchQuery, sortConfig]);

  const columns = [
    { width: "250px", key: "name", label: "Name" },
    { width: "210px", key: "email", label: "Email", sortable: true },
    { width: "150px", key: "contact", label: "Contact", sortable: true },
    { width: "150px", key: "company", label: "Company", sortable: true },
    { width: "90px", key: "isActive", label: "Status",sortable: true },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Edit":
        try {
          const result = await getDataById("user",row._id);
          openEditModal(result.data);
        } catch (err) {
          toast.error("Failed to fetch carrier details for editing.");
        }
        break;
      case "Change Password":
        setCarrierDetails(row);
        setchangePasswordModel(true);
        break;
      case "Delete":
        try {
          const result = await deleteData("user", row._id);
          if (result.success) {
            toast.success(result.message);
            fetchCarrierData();
          }
        } catch (err) {
          toast.error("Failed to delete carrier.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateData("user",row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchCarrierData();
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

  const getActionsForCarrier = (carrier: User): string[] => {
    const actions = ["View Details", "Edit"];
    if (carrier.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Change Password");
    actions.push("Delete");
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchCarrierData(page);
  };
  const handleItemsPerPageChange = (limit: number) => {
    fetchCarrierData(1, limit);
  };

  const getRowData = () => {
    return carriers.map((carrier) => ({
      _id: carrier._id,
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar
              avatarUrl={carrier.avatarUrl}
              firstName={carrier.firstName}
              lastName={carrier.lastName}
              email={carrier.email}
              size={35}
            />
          </div>
          <div className="name">{`${carrier.firstName} ${carrier.lastName}`}</div>
        </div>
      ),
      email: carrier.email,
      contact: carrier.primaryNumber
        ? formatPhoneNumber(carrier.primaryNumber)
        : "N/A",
      company: carrier.company || "N/A",
      isActive: carrier.isActive ? "Active" : "Inactive",
      actions: getActionsForCarrier(carrier),
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCarrierToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (carrierData: Partial<CreateUserForm>) => {
    setIsEditing(true);
    setCarrierToEdit(carrierData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCarrierToEdit(null); // Clear form data on modal close
  };

  // View Details Option Added
  const openDetailsModal = (carrierData: Partial<User>) => {
    setCarrierDetails(carrierData);
    setIsDetailsModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="carriers-list-wrapper">
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">Carriers</h2>
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
          <Table
            columns={columns}
            rows={getRowData()}
            data={carriers}
            onActionClick={handleAction}
            rowClickable={true}
            onSort={handleSort}
            sortConfig={sortConfig}
            onRowClick={handleRowClick}
          />
          <div className="pagination-container">
            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      <CreateOrEditCarrier
        isModalOpen={isModalOpen}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchCarrierData(); // Refresh carriers after modal close
        }}
        isEditing={isEditing}
        carrierData={carrierToEdit}
        closeModal={closeModal}
      />

      <CarrierDetailsModal
        isOpen={isDetailsModalOpen}
        carrier={carrierDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {changePasswordModel && (
        <ChangePassowrd
          email={carrierDetails?.email!}
          isModalOpen={changePasswordModel}
          closeModal={() => {
            setchangePasswordModel(false);
            setCarrierDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default CarrierList;
