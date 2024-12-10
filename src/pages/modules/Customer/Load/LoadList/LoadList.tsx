import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import FilterShape from "../../../../../assets/icons/Filter.svg";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./LoadList.scss";
import { Load } from "../../../../../types/Load";
import {
  deleteLoad,
  getloads,
} from "../../../../../services/load/loadServices";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../../utils/dateFormat";
import { formatDistance } from "../../../../../utils/distanceCalculator";

const LoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate()
  const [loads, setLoads] = useState<Load[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [sortFilter, setSortFilter] = useState<string | null>(null); // state for sorting filter
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sort order state
  const [searchQuery, setSearchQuery] = useState<string>("");


  const handleSortFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSortFilter(event.target.value);
  };

  const {
    fetchData: fetchLoads,
    deleteDataById: deleteLoads,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getloads,
    deleteDataService: deleteLoad,
  });

  // Fetch Load data
  const fetchLoadsData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}`;

        //Search Functionality
        if (searchQuery) {
          query += `&search=${encodeURIComponent(searchQuery)}`;
        }

        if (sortFilter) {
          query += `&sortBy=${sortFilter}&sortOrder=${sortOrder}`;
        }

        const result = await fetchLoads(query);
        if (result.success) {
          let loadData = result.data as Load[];

          // setCustomers(result.data as User[]);
          setLoads(loadData);
          setMeta(result.meta as Meta);
        }
      } catch (err) {
        toast.error("Error fetching Loads data.");
      }
    },
    [fetchLoads, sortOrder, searchQuery, user]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoadsData();
    }
  }, [user, sortFilter, sortOrder, searchQuery]);

  const columns = [
    { key: "origin", label: "Origin", width: "30%" },
    { key: "destination", label: "Destination" },
    { key: "originEarlyPickupDate", label: "Pick-up" },
    { key: "originEarlyPickupTime", label: "Pick-up Time" },
    { key: "equipment", label: "Equipment" },
    { key: "miles", label: "Miles" },
    { key: "mode", label: "Mode" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "view":
      break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const getActionsForLoad = (load: Load): string[] => {
    const actions = ["View Details"];
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchLoadsData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchLoadsData(1, limit);
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
    return loads.map((load) => ({
      _id: load._id,
      origin: load.origin.str,
      destination: load.destination.str || "N/A",
      originEarlyPickupDate: formatDate(load.originEarlyPickupDate, "MM/dd/yyyy") || "N/A",
      originEarlyPickupTime: formatDate(load.originEarlyPickupDate, "h:mm aa") || "N/A",
      equipment: load.equipment || "N/A",
      mode: load.mode || "N/A",
      miles: formatDistance(load.miles!) || "N/A",
      actions: getActionsForLoad(load),
    }));
  };

  const handleCloseDropdown = () => {
    const dropdownMenu = document.getElementById("filterList");
    dropdownMenu?.classList.remove("show"); // This will close the dropdown
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearAllFilters = () => {
    setSortFilter(null);
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">SPLS Load Board</h2>
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
          onClick={() => navigate(`load/create`)}
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
            data={loads}
            onActionClick={handleAction}
          />
          {loads?.length > 0 && (
            <div className="pagination-container">
            {/* Pagination Component */}
            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoadList;
