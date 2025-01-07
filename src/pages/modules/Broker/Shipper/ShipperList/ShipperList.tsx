import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import { UserRole } from "../../../../../enums/UserRole";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import "./ShipperList.scss";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import CreateOrEditShipper, {
  ShipperForm,
} from "../CreateOrEditShipper/CreateOrEditShipper";
import { Shipper } from "../../../../../types/Shipper";
import {
  deleteShipper,
  getShipper,
  getShipperById,
  toggleActiveShipper,
} from "../../../../../services/shipper/shipperService";
import ShipperDetailsModal from "../ShipperDetailsModal/ShipperDetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";

const ShipperList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [shipperData, setShipperData] = useState<ShipperForm | null>(null);
  const [shippers, setShippers] = useState<Shipper[]>([]);
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
  const [shipperDetails, setShipperDetails] = useState<Partial<Shipper> | null>(
    null
  );

  const {
    fetchData: fetchShippers,
    fetchDataById: fetchShipperById,
    deleteDataById: deleteDataById,
    updateData: updateStatus,
    loading,
  } = useFetchData<any>({
    fetchDataService: getShipper,
    fetchByIdService: getShipperById,
    deleteDataService: deleteShipper,
    updateDataService: toggleActiveShipper,
  });
  
  const fetchShippersData = useCallback(
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

        const result = await fetchShippers(query);
        if (result.success) {
          let userData = result.data as Shipper[];

          // setCustomers(result.data as User[]);
          setShippers(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch Shipper Users.");
        }
      } catch (err) {
        toast.error("Error fetching Shipper data.");
      }
    },
    [fetchShippers, searchQuery, user, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchShippersData();
    }
  }, [user, searchQuery, sortConfig]);

  const openCreateModal = () => {
    setIsEditing(false);
    setShipperData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (data: ShipperForm) => {
    setIsEditing(true);
    setShipperData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShipperData(null);
  };

  // View Details Option Added
  const openDetailsModal = (shipperData: Partial<Shipper>) => {
    setShipperDetails(shipperData);
    setIsDetailsModalOpen(true);
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;

      case "Edit":
        try {
          const result = await fetchShipperById(row._id);
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
            fetchShippersData();
          }
        } catch {
          toast.error("Failed to delete Shipper.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateStatus(row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchShippersData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} Shipper.`);
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

  const getActions = (shipper: Shipper): string[] => {
    const actions = ["View Details", "Edit"];
    if (shipper.isActive) {
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
    fetchShippersData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchShippersData(1, limit);
  };

  const getRowData = () => {
    return shippers.map((shipper) => ({
      _id: shipper._id,
      name: `${shipper.firstName} ${shipper.lastName}`,
      email: shipper.email,
      contact: shipper.primaryNumber
      ? formatPhoneNumber(shipper.primaryNumber)
      : "N/A",
      shippingHours: shipper.shippingHours,
      isActive: shipper.isActive ? "Active" : "Inactive",
      actions: getActions(shipper),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="shipper-list-wrapper">
      <h2 className="fw-bolder">Shippers</h2>
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
            data={shippers}
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

      <CreateOrEditShipper
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchShippersData();
        }}
        isEditing={isEditing}
        shipperData={shipperData}
      />

      <ShipperDetailsModal
        isOpen={isDetailsModalOpen}
        shipper={shipperDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default ShipperList;
