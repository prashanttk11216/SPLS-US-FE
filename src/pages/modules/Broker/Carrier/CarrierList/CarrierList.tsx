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
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./CarrierList.scss";
import CarrierDetailsModal from "../CarrierDetailsModal/CarrierDetailsModal";

const CarrierList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [carrierToEdit, setCarrierToEdit] = useState<Partial<User> | null>(
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [carrierDetails, setCarrierDetails] = useState<Partial<User> | null>(
    null
  );

  const {
    fetchData: fetchCarriers,
    fetchDataById: fetchCarrier,
    deleteDataById: deleteCarrier,
    updateData: updateStatus,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    fetchByIdService: getUserById,
    deleteDataService: deleteUser,
    updateDataService: toggleActiveStatus,
  });

  // Fetch Carrier data
  const fetchCarrierData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?role=${UserRole.CARRIER}&page=${page}&limit=${limit}`;

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

        const result = await fetchCarriers(query);
        if (result.success) {
          let userData = result.data as User[];

          // setCustomers(result.data as User[]);
          setCarriers(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch carriers.");
        }
      } catch (err) {
        toast.error("Error fetching carrier data.");
      }
    },
    [fetchCarriers, searchQuery, user, sortConfig]
  );

  // Use a single fetch on initial render and when currentPage, itemsPerPage, or user changes
  useEffect(() => {
    if (user && user._id) {
      fetchCarrierData();
    }
  }, [user, searchQuery, sortConfig]);

  const columns = [
    { key: "name", label: "Name", width: "40%" },
    { key: "email", label: "Email", sortable: true },
    { key: "contact", label: "Contact", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        try {
          const carrierData = await fetchCarrier(row._id);
          openDetailsModal(carrierData.data); // Open details modal
        } catch (err) {
          toast.error("Failed to fetch carrier details.");
        }
        break;
      case "Edit":
        try {
          const carrierData = await fetchCarrier(row._id);
          openEditModal(carrierData.data);
        } catch (err) {
          toast.error("Failed to fetch carrier details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deleteCarrier(row._id);
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
          const result = await updateStatus(row._id, {});
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
      contact: carrier.primaryNumber || "N/A",
      company: carrier.company || "N/A",
      status: carrier.isActive ? "Active" : "Inactive",
      actions: getActionsForCarrier(carrier),
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCarrierToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (carrierData: Partial<User>) => {
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
      <h2 className="fw-bolder">Carrier List</h2>
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
    </div>
  );
};

export default CarrierList;
