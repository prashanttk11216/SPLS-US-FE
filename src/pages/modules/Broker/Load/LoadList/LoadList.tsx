import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import { UserRole } from "../../../../../enums/UserRole";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  Meta,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./LoadList.scss";
import { Load } from "../../../../../types/Load";
import {
  deleteLoad,
  getloads,
  refreshAgeforLoad,
  updateLoadStatus,
} from "../../../../../services/load/loadServices";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../../utils/dateFormat";
import { LoadStatus } from "../../../../../enums/LoadStatus";
import LoadDetailsModal from "../LoadDetailsModal/LoadDetailsModal";
import { formatDistance } from "../../../../../utils/distanceCalculator";
import { RateConfirmationNotification } from "../RateConfirmationNotification/RateConfirmationNotification";
import { LoadCreationAlert } from "../LoadCreationAlert/LoadCreationAlert";

const LoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [loads, setLoads] = useState<Load[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const savedActiveTab = localStorage.getItem("activeTab");
  const [activeTab, setActiveTab] = useState<LoadStatus>(
    savedActiveTab ? (savedActiveTab as LoadStatus) : LoadStatus.Published
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "age", direction: "desc" });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [loadDetails, setLoadDetails] = useState<Partial<Load> | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<string | null>(null);
  const [selectedLoads, setSelectedLoads] = useState<string[] | null>(null);

  const closeModal = () => {
    setSelectedLoad(null);
    setIsDetailsModalOpen(false);
    setLoadDetails(null);
  };

  const closeLoadCreationModal = () => {
    setSelectedLoads(null);
    fetchLoadsData();
  };

  const {
    fetchData: fetchLoads,
    updateData: loadStatus,
    deleteDataById: deleteLoads,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getloads,
    updateDataService: updateLoadStatus,
    deleteDataService: deleteLoad,
  });

  // Fetch Load data
  const fetchLoadsData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}&status=${activeTab}`;

        //Search Functionality
        if (searchQuery) {
          query += `&search=${encodeURIComponent(searchQuery)}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await fetchLoads(query);
        if (result.success) {
          let loadData = result.data as Load[];

          // setCustomers(result.data as User[]);
          setLoads(loadData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch customers.");
        }
      } catch (err) {
        toast.error("Error fetching customer data.");
      }
    },
    [fetchLoads, searchQuery, user, activeTab, sortConfig]
  );

  const refreshAgeCall = async (data: any) => {
    const result = await refreshAgeforLoad(data);
    if (result.success) {
      toast.success(result.message);
      setTimeout(() => {
        fetchLoadsData();
      }, 500);
    }
  };

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoadsData();
    }
  }, [user, searchQuery, activeTab, sortConfig]);

  // Update active tab in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const columns = [
    { width: "90px", key: "age", label: "Age", sortable: true, bold: true },
    {
      width: "160px",
      key: "loadNumber",
      label: "Load/Reference Number",
      sortable: true,
    },
    { width: "150px", key: "origin.str", label: "Origin", sortable: true },
    {
      width: "150px",
      key: "destination.str",
      label: "Destination",
      sortable: true,
    },
    {
      width: "120px",
      key: "originEarlyPickupDate",
      label: "Pick-up",
      sortable: true,
    },
    {
      width: "150px",
      key: "originEarlyPickupTime",
      label: "Pick-up Time",
      sortable: true,
    },
    { width: "150px", key: "equipment", label: "Equipment", sortable: true },
    { width: "120px", key: "miles", label: "Miles", sortable: true },
    { width: "120px", key: "mode", label: "Mode", sortable: true },
    { width: "140px", key: "brokerRate", label: "Broker Rate", sortable: true },
    { width: "140px", key: "allInRate", label: "All-in Rate", sortable: true },
    { width: "120px", key: "weight", label: "Weight", sortable: true },
    { width: "120px", key: "length", label: "Length", sortable: true },
    { width: "120px", key: "width", label: "Width", sortable: true },
    { width: "120px", key: "height", label: "Height", sortable: true },
    { width: "120px", key: "loadOption", label: "Load Option" },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Edit":
        navigate(
          `create/${row._id}${
            activeTab === LoadStatus.Draft ? "?draft=true" : ""
          }`
        );
        break;
      case LoadStatus.Published:
        try {
          const result = await loadStatus(row._id, {
            status: LoadStatus.Published,
          });
          if (result.success) {
            toast.success(result.message);
            fetchLoadsData();
          }
        } catch (err) {
          toast.error("Failed to delete customer.");
        }
        break;
      case LoadStatus.PendingResponse:
        try {
          const result = await loadStatus(row._id, {
            status: LoadStatus.PendingResponse,
          });
          if (result.success) {
            toast.success(result.message);
            fetchLoadsData();
          }
        } catch (err) {
          toast.error("Failed to change Load Status.");
        }
        break;
      case LoadStatus.DealClosed:
        try {
          const result = await loadStatus(row._id, {
            status: LoadStatus.DealClosed,
          });
          if (result.success) {
            toast.success(result.message);
            fetchLoadsData();
          }
        } catch (err) {
          toast.error("Failed to delete customer.");
        }
        break;
      case LoadStatus.Cancelled:
        try {
          const result = await loadStatus(row._id, {
            status: LoadStatus.Cancelled,
          });
          if (result.success) {
            toast.success(result.message);
            fetchLoadsData();
          }
        } catch (err) {
          toast.error("Failed to delete customer.");
        }
        break;
      case "Notify Customer":
        setSelectedLoad(row._id);
        break;
      case "Delete":
        try {
          const result = await deleteLoads(row._id);
          if (result.success) {
            toast.success(result.message);
            fetchLoadsData();
          }
        } catch (err) {
          toast.error("Failed to delete customer.");
        }
        break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const handleRowClick = async (row: Record<string, any>) => {
    if (row) {
      setLoadDetails(row);
      setIsDetailsModalOpen(true);
    }
  };

  const handleSort = (
    sortStr: { key: string; direction: "asc" | "desc" } | null
  ) => {
    setSortConfig(sortStr); // Updates the sort query to trigger API call
  };

  const getActionsForLoad = (_: Load): string[] => {
    const actions = ["View Details", "Edit"];
    if (activeTab == LoadStatus.Draft) {
      actions.push("Published");
    }
    if (activeTab == LoadStatus.Published) {
      actions.push("Pending Response");
    }
    if (activeTab == LoadStatus.PendingResponse) {
      actions.push("Notify Customer");
      actions.push("Deal Closed");
      actions.push("Cancelled");
    }
    actions.push("Delete");
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchLoadsData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchLoadsData(1, limit);
  };

  const getRowData = () => {
    return loads.map((load) => ({
      _id: load._id,
      age: load.formattedAge || "N/A",
      "origin.str": load.origin.str,
      "destination.str": load.destination.str || "N/A",
      originEarlyPickupDate:
        formatDate(load.originEarlyPickupDate, "MM/dd/yyyy") || "N/A",
      originEarlyPickupTime:
        formatDate(load.originEarlyPickupDate, "h:mm aa") || "N/A",
      equipment: load.equipment || "N/A",
      miles: formatDistance(load.miles!) || "N/A",
      mode: load.mode || "N/A",
      brokerRate: load.allInRate || "N/A",
      allInRate: load.customerRate || "N/A",
      weight: load.weight || "N/A",
      length: load.length || "N/A",
      width: load.width || "N/A",
      height: load.height || "N/A",
      loadOption: load.loadOption || "N/A",
      loadNumber: load.loadNumber || "N/A",
      actions: getActionsForLoad(load),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleGeneralAction = (action: any, selectedData: any) => {
    switch (action) {
      case "Refresh Loads":
        let ids: string[] = [];
        selectedData.map((item: any) => ids.push(item._id));
        refreshAgeCall({ ids });
        break;
      case "Notify Carrier":
        let loadIds: string[] = [];
        selectedData.map((item: any) => loadIds.push(item._id));
        setSelectedLoads(loadIds);
        break;
      default:
        break;
    }
    console.log(`General Action: ${action}`, selectedData);
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">SPLS Load Board</h2>
      <div className="d-flex align-items-center my-3">
        {/* Search Bar */}
        <div className="searchbar-container">
          <SearchBar onSearch={handleSearch} />
        </div>

        <button
          className="btn btn-accent d-flex align-items-center ms-auto"
          type="button"
          onClick={() => navigate(`create`)}
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
          {user.role === UserRole.BROKER_ADMIN && (
            <ul className="nav nav-tabs">
              <li
                className="nav-item"
                onClick={() => setActiveTab(LoadStatus.Published)}
              >
                <a
                  className={`nav-link ${
                    LoadStatus.Published == activeTab && "active"
                  }`}
                  aria-current="page"
                  href="#"
                >
                  Loads
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(LoadStatus.Draft)}
              >
                <a
                  className={`nav-link ${
                    LoadStatus.Draft == activeTab && "active"
                  }`}
                  href="#"
                >
                  Available/Draft
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(LoadStatus.PendingResponse)}
              >
                <a
                  className={`nav-link ${
                    LoadStatus.PendingResponse == activeTab && "active"
                  }`}
                  href="#"
                >
                  Pending Response
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(LoadStatus.DealClosed)}
              >
                <a
                  className={`nav-link ${
                    LoadStatus.DealClosed == activeTab && "active"
                  }`}
                  href="#"
                >
                  Deal Closed
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(LoadStatus.Cancelled)}
              >
                <a
                  className={`nav-link ${
                    LoadStatus.Cancelled == activeTab && "active"
                  }`}
                  href="#"
                >
                  Cancelled
                </a>
              </li>
            </ul>
          )}
          <Table
            columns={columns}
            rows={getRowData()}
            data={loads}
            onActionClick={handleAction}
            onRowClick={handleRowClick}
            onSort={handleSort}
            sortConfig={sortConfig}
            rowClickable={true}
            showCheckbox={true}
            tableActions={["Refresh Loads", "Notify Carrier"]}
            onTableAction={handleGeneralAction}
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

      {selectedLoad && (
        <RateConfirmationNotification
          selectedLoad={selectedLoad}
          closeModal={closeModal}
        />
      )}

      {selectedLoads && (
        <LoadCreationAlert
          selectedLoads={selectedLoads}
          closeModal={closeLoadCreationModal}
        />
      )}

      <LoadDetailsModal
        load={loadDetails}
        onClose={closeModal}
        isOpen={isDetailsModalOpen}
      />
    </div>
  );
};

export default LoadList;
