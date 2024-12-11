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
import FilterDropdown from "../../../../../components/common/FilterDropdown/FilterDropDown";

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
  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Inactive" | null
  >(null); // state for filter

  const [sortFilter, setSortFilter] = useState<string | null>(null); // state for sorting filter
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sort order state
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        // Append `isActive` filter based on `statusFilter`
        if (statusFilter === "Active") {
          query += `&isActive=true`;
        } else if (statusFilter === "Inactive") {
          query += `&isActive=false`;
        }

        if (user.role === UserRole.BROKER_USER) {
          query += `&brokerId=${user._id}`;
        }

        if (sortFilter) {
          query += `&sortBy=${sortFilter}&sortOrder=${sortOrder}`;
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
    [fetchConsignees, statusFilter, sortOrder, searchQuery, user]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchConsigneesData();
    }
  }, [user, statusFilter, sortFilter, sortOrder, searchQuery]);

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
        try {
          const consigneeData = await fetchConsigneeById(row._id);
          openDetailsModal(consigneeData.data); // Open details modal
        } catch (err) {
          toast.error("Failed to fetch carrier details.");
        }
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
    { key: "name", label: "Name", width: "30%" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "shippingHours", label: "Shipping Hours" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
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
      contact: consignee.primaryNumber || "N/A",
      shippingHours: consignee.shippingHours,
      status: consignee.isActive ? "Active" : "Inactive",
      actions: getActions(consignee),
    }));
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleClearFilters = () => {
    setStatusFilter(null); // Clear status filter
    setSortFilter("default"); // Reset sort filter
    setSortOrder("asc"); // Reset sort order
  };
  


  return (
    <div className="consignee-list-wrapper">
      <h2 className="fw-bolder">Consignees</h2>
      <div className="d-flex align-items-center my-3">
        {/* Filter Dropdown */}
       
       
        <FilterDropdown
          statusFilter={statusFilter}
          sortFilter={sortFilter}
          sortOrder={sortOrder}
          onStatusFilterChange={setStatusFilter}
          onSortFilterChange={(sort, order) => {
            setSortFilter(sort);
            setSortOrder(order);
          }}
          onClearFilters={handleClearFilters}
        />

        {/* Search Bar */}
        <div className="searchbar-container ms-4">
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
