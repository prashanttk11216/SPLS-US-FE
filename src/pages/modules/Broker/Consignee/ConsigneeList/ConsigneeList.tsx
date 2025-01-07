import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import { UserRole } from "../../../../../enums/UserRole";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import "./ConsigneeList.scss";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import { Consignee } from "../../../../../types/Consignee";
import {
  deleteConsignee,
  getConsignee,
  getConsigneeById,
  toggleActiveConsignee,
} from "../../../../../services/consignee/consigneeService";
import CreateOrEditConsignee from "../CreateOrEditConsignee/CreateOrEditConsignee";
import ConsigneeDetailsModal from "../ConsigneeDetailsModal/ConsigneeDetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";

const ConsigneeList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [consigneeData, setConsigneeData] = useState<Partial<Consignee> | null>(
    null
  );
  const [consignees, setConsignee] = useState<Consignee[]>([]);
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
  const [consigneeDetails, setConsigneeDetails] =
    useState<Partial<Consignee> | null>(null);

  const {
    fetchData: fetchConsignees,
    fetchDataById: fetchConsigneeById,
    deleteDataById: deleteDataById,
    updateData: updateStatus,
    loading,
  } = useFetchData<any>({
    fetchDataService: getConsignee,
    fetchByIdService: getConsigneeById,
    deleteDataService: deleteConsignee,
    updateDataService: toggleActiveConsignee,
  });

  const fetchConsigneesData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?&page=${page}&limit=${limit}`;

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

        const result = await fetchConsignees(query);
        if (result.success) {
          let userData = result.data as Consignee[];

          // setCustomers(result.data as User[]);
          setConsignee(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch Consignee Users.");
        }
      } catch (err) {
        toast.error("Error fetching Consignee data.");
      }
    },
    [fetchConsignees, searchQuery, user, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchConsigneesData();
    }
  }, [user, searchQuery, sortConfig]);

  const openCreateModal = () => {
    setIsEditing(false);
    setConsigneeData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (data: Partial<Consignee>) => {
    setIsEditing(true);
    setConsigneeData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setConsigneeData(null);
  };

  // View Details Option Added
  const openDetailsModal = (consigneeData: Partial<Consignee>) => {
    setConsigneeDetails(consigneeData);
    setIsDetailsModalOpen(true);
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Edit":
        try {
          const result = await fetchConsigneeById(row._id);
          openEditModal(result.data);
        } catch {
          toast.error("Failed to fetch user details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deleteDataById(row._id);
          if (result.success) {
            toast.success(result.message);
            fetchConsigneesData();
          }
        } catch {
          toast.error("Failed to delete Consignee.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateStatus(row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchConsigneesData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} Consignee.`);
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

  const getActions = (consignee: Consignee): string[] => {
    const actions = ["View Details", "Edit"];
    if (consignee.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Delete");
    return actions;
  };

  const columns = [
    { width: "250px", key: "name", label: "Name" },
    { width: "210px", key: "email", label: "Email", sortable: true },
    { width: "150px", key: "contact", label: "Contact", sortable: true },
    {
      width: "170px",
      key: "shippingHours",
      label: "Shipping Hours",
      sortable: true,
    },
    { width: "90px", key: "isActive", label: "Status", sortable: true },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handlePageChange = (page: number) => {
    fetchConsigneesData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchConsigneesData(1, limit);
  };

  const getRowData = () => {
    return consignees.map((consignee) => ({
      _id: consignee._id,
      name: `${consignee.firstName} ${consignee.lastName}`,
      email: consignee.email,
      contact: consignee.primaryNumber
        ? formatPhoneNumber(consignee.primaryNumber)
        : "N/A",
      shippingHours: consignee.shippingHours,
      isActive: consignee.isActive ? "Active" : "Inactive",
      actions: getActions(consignee),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="consignee-list-wrapper">
      <h2 className="fw-bolder">Consignees</h2>
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
            data={consignees}
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

      <CreateOrEditConsignee
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchConsigneesData();
        }}
        isEditing={isEditing}
        consigneeData={consigneeData}
      />

      <ConsigneeDetailsModal
        isOpen={isDetailsModalOpen}
        consignee={consigneeDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default ConsigneeList;
