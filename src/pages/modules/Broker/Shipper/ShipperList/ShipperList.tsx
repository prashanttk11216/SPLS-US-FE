import React, { useCallback, useEffect, useState } from "react";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { UserRole } from "../../../../../enums/UserRole";
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Avatar from "../../../../../components/common/Avatar/Avatar";
import Table from "../../../../../components/common/Table/Table";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import FilterShape from "../../../../../assets/icons/Filter.svg";
import closeLogo from "../../../../../assets/icons/closeLogo.svg";
import "./ShipperList.scss";
import { RootState } from "../../../../../store/store";
import Loading from "../../../../../components/common/Loading/Loading";
import { ApiResponse } from "../../../../../types/responseTypes";
import { Shipper } from "../../../../../types/Shipper";
import {
  deleteShipper,
  editShipper,
  getShipperById,
  toggleActiveShipper,
} from "../../../../../services/shipper/shipperService";
import CreateOrEditShipper from "../CreateOrEditShipper/CreateOrEditShipper";

const ShipperList: React.FC = () => {
  const user = useSelector((state: RootState) => state.shipper);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [shipperToEdit, setShipperToEdit] = useState<Partial<Shipper> | null>(
    null
  );

  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Inactive" | null
  >(null); // state for filter
  const [sortFilter, setSortFilter] = useState<string | null>(null); // state for sorting filter
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sort order state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const handleSortFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSortFilter(event.target.value);
  };

  const fetchShipperById = async (id: string): Promise<ApiResponse<any>> => {
    return await editShipper(id, {}); // Pass an empty object or default data
  };

  const {
    fetchData: fetchShippers,
    fetchDataById: fetchShipper,
    deleteDataById: deletedShipper,
    updateData: updateStatus,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getShipperById,
    fetchByIdService: fetchShipperById,
    deleteDataService: deleteShipper,
    updateDataService: toggleActiveShipper,
  });

  const fetchShipperData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?role=${UserRole.SHIPPER}&page=${page}&limit=${limit}`;

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

        const result = await fetchShippers(query);
        if (result.success) {
          let userData = result.data as Shipper[];

          // setsShippers(result.data as User[]);
          setShippers(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch shipper.");
        }
      } catch (err) {
        toast.error("Error fetching shipper data.");
      }
    },
    [fetchShippers, statusFilter, sortOrder, searchQuery, user]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchShipperData();
    }
  }, [user, statusFilter, sortFilter, sortOrder, searchQuery]);

  const columns = [
    { key: "name", label: "Name", width: "40%" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "Edit":
        try {
          const shipperData = await fetchShipper(row._id);
          openEditModal(shipperData.data);
        } catch (err) {
          toast.error("Failed to fetch shipper details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deletedShipper(row._id);
          if (result.success) {
            toast.success(result.message);
            fetchShipperData();
          }
        } catch (err) {
          toast.error("Failed to delete consginee.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateStatus(row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchShipperData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} user.`);
        }
        break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const getActionsForShipper = (broker: Shipper): string[] => {
    const actions = ["Edit"];
    if (broker.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Delete");
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchShipperData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchShipperData(1, limit);
  };

  const handleSortClick = (column: string) => {
    // If the clicked column is the same as the current column
    if (sortFilter === column) {
      // Toggle the sort order (ASC <-> DESC)
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      // If a new column is clicked, reset sort order to "asc" and update the filter
      setSortFilter(column);
      setSortOrder("asc");
    }
  };

  const getRowData = () => {
    return shippers.map((shipper) => ({
      _id: shipper._id,
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar
              avatarUrl={shipper.avatarUrl}
              firstName={shipper.firstName}
              lastName={shipper.lastName}
              email={shipper.email}
              size={35}
            />
          </div>
          <div className="name">{`${shipper.firstName} ${shipper.lastName}`}</div>
        </div>
      ),
      email: shipper.email,
      contact: shipper.primaryNumber || "N/A",
      status: shipper.isActive ? "Active" : "Inactive",
      actions: getActionsForShipper(shipper),
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setShipperToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (shipperData: Partial<Shipper>) => {
    setIsEditing(true);
    setShipperToEdit(shipperData);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setShipperToEdit(null); // Clear form data on modal close
  };

  const handleCloseDropdown = () => {
    const dropdownMenu = document.getElementById("filterList");
    dropdownMenu?.classList.remove("show"); // This will close the dropdown
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearAllFilters = () => {
    setStatusFilter(null);
    setSortFilter(null);
  };

  return (
    <div className="shipper-list-wrapper">
      <h2 className="fw-bolder">Shipper</h2>

      <div className="d-flex align-items-center my-3">
        {/* Filter Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-outline-primary dropdown-toggle"
            type="button"
            id="sortDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img src={FilterShape} alt="FilterShape" height={20} width={20} />
            <span
              style={{
                fontSize: "17px",
                margin: "6px",
                lineHeight: "16.94px",
              }}
            >
              Filter
            </span>
          </button>
          <ul
            className="dropdown-menu mt-3"
            aria-labelledby="sortDropdown"
            id="filterList"
            style={{ width: "224px" }}
          >
            <div className="d-flex justify-content-between align-items-center form-check">
              <span
                style={{
                  marginTop: "10px",
                  fontWeight: "600",
                }}
              >
                Filter by Status:
              </span>
              <img
                src={closeLogo}
                alt="Close"
                onClick={handleCloseDropdown}
                style={{
                  width: "11px",
                  height: "13px",
                  marginRight: "8px",
                  marginTop: "-15px",
                  cursor: "pointer",
                }}
              />
            </div>
            {/* Active/Inactive Filters */}
            <li>
              <label className="filter-label d-flex align-items-center w-100 form-check">
                <span className="filter-text">Active</span>
                <input
                  type="radio"
                  name="statusFilter"
                  value="Active"
                  checked={statusFilter === "Active"}
                  onChange={() => setStatusFilter("Active")}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>
            <li>
              <label className="filter-label d-flex align-items-center w-100 form-check">
                <span className="filter-text">Inactive</span>
                <input
                  type="radio"
                  name="statusFilter"
                  value="Inactive"
                  checked={statusFilter === "Inactive"}
                  onChange={() => setStatusFilter("Inactive")}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>

            <div className="d-flex justify-content-between align-items-center form-check">
              <span
                style={{
                  marginTop: "10px",
                  fontWeight: "600",
                }}
              >
                Sort by:
              </span>
            </div>
            <li>
              <label className="filter-label d-flex align-items-center w-100 form-check">
                <span
                  className="filter-text"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSortClick("firstName");
                  }}
                >
                  First Name (
                  {sortFilter === "firstName" ? sortOrder.toUpperCase() : "ASC"}
                  )
                </span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="firstName"
                  checked={sortFilter === "firstName"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>
            <li>
              <label
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSortClick("lastName");
                }}
                className="filter-label d-flex align-items-center w-100 form-check"
              >
                <span className="filter-text">
                  Last Name (
                  {sortFilter === "lastName" ? sortOrder.toUpperCase() : "ASC"})
                </span>
                <input
                  type="radio"
                  name="sortFilter"
                  value="lastName"
                  checked={sortFilter === "lastName"}
                  onChange={handleSortFilterChange}
                  className="ms-auto me-4 form-check-input"
                />
              </label>
            </li>
            <div className="dropdown-divider"></div>
            {/* Clear Filter Button */}
            <li className="text-center mt-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            </li>
          </ul>
        </div>

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
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={getRowData()}
            data={shippers}
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

      <CreateOrEditShipper
        isModalOpen={isModalOpen}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchShipperData(); // Refresh shipper after modal close
        }}
        closeModal={closeModal}
        isEditing={isEditing}
        shipperData={shipperToEdit}
      />
    </div>
  );
};

export default ShipperList;
