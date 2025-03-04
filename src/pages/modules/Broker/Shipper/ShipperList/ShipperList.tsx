import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import "./ShipperList.scss";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  PaginationState,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import CreateOrEditShipper from "../CreateOrEditShipper/CreateOrEditShipper";
import { Shipper } from "../../../../../types/Shipper";
import {
  deleteShipper,
  getShipper,
  toggleActiveShipper,
} from "../../../../../services/shipper/shipperService";
import ShipperDetailsModal from "../ShipperDetailsModal/ShipperDetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";
import usePagination from "../../../../../hooks/usePagination";
import { SortOption } from "../../../../../types/GeneralTypes";

const ShipperList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [shipperId, setShipperId] = useState<string>();
  const [shippers, setShippers] = useState<Shipper[]>([]);
   const { meta, updatePagination } = usePagination(); // Pagination metadata
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("email");

  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [shipperDetails, setShipperDetails] = useState<Partial<Shipper> | null>(
    null
  );

  const { getData, updateData, deleteData, loading } = useFetchData<any>({
    getAll: {
      shipper: getShipper,
    },
    update: {
      shipper: toggleActiveShipper,
    },
    remove: {
      shipper: deleteShipper,
    }
  });

  const fetchShippers = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?page=${page}&limit=${limit}&populate=brokerId,postedBy`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getData("shipper", query);
        if (result.success) {
          const userData = result.data as Shipper[];

          // setCustomers(result.data as User[]);
          setShippers(userData);
          updatePagination(result.meta as PaginationState);
        } else {
          toast.error(result.message || "Failed to fetch Shipper Users.");
        }
      } catch (err) {
        toast.error("Error fetching Shipper data.");
      }
    },
    [getData, searchQuery, user, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchShippers();
    }
  }, [user, searchQuery, sortConfig]);

  const openCreateModal = () => {
    setIsEditing(false);
    setShipperId("");
    setIsModalOpen(true);
  };

  const openEditModal = (_id: string) => {
    setIsEditing(true);
    setShipperId(_id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShipperId("");
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
        openEditModal(row._id);
        break;
      case "Delete":
        try {
          const result = await deleteData("shipper", row._id);
          if (result.success) {
            toast.success(result.message);
            fetchShippers();
          }
        } catch {
          toast.error("Failed to delete Shipper.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateData("shipper", row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchShippers();
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

  return (
    <div className="shipper-list-wrapper">
      <div className="d-flex align-items-center">
        <h2 className="fw-bolder">Shippers</h2>
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
            onSearch={(query: string) => setSearchQuery(query)}
            searchFieldOptions={[
              { label: "Email", value: "email" },
              { label: "Name", value: "name" },
              { label: "Shipping Hours", value: "shippingHours" },
              { label: "Contact", value: "primaryNumber" },
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
            data={shippers}
            onActionClick={handleAction}
            rowClickable={true}
            onSort={(sortStr: SortOption) => setSortConfig(sortStr)}

            sortConfig={sortConfig}
            onRowClick={handleRowClick}
          />
          <div className="pagination-container">
            {/* Pagination Component */}
            <Pagination
              meta={meta}
              onPageChange={(page: number) => fetchShippers(page)}
              onItemsPerPageChange={(limit: number) => fetchShippers(1, limit)}
            />
          </div>
        </>
      )}

      {isModalOpen && (
        <CreateOrEditShipper
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          setIsModalOpen={(value: boolean) => {
            setIsModalOpen(value);
            if (!value) fetchShippers();
          }}
          isEditing={isEditing}
          shipperId={shipperId}
        />
      )}

      {isDetailsModalOpen && (
        <ShipperDetailsModal
          isOpen={isDetailsModalOpen}
          shipper={shipperDetails}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ShipperList;
