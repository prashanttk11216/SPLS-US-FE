import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  PaginationState,
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
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../../../../utils/dateFormat";
import { LoadStatus } from "../../../../../enums/LoadStatus";
import LoadDetailsModal from "../LoadDetailsModal/LoadDetailsModal";
import { RateConfirmationNotification } from "../RateConfirmationNotification/RateConfirmationNotification";
import { LoadCreationAlert } from "../LoadCreationAlert/LoadCreationAlert";
import { formatNumber } from "../../../../../utils/numberUtils";
import { Equipment } from "../../../../../enums/Equipment";
import { getEnumValue } from "../../../../../utils/globalHelper";
import usePagination from "../../../../../hooks/usePagination";


const LOAD_ACTIVE_TAB = "LOAD_ACTIVE_TAB";

const LoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [loads, setLoads] = useState<Load[]>([]);
   const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("loadNumber");

  const savedActiveTab = localStorage.getItem(LOAD_ACTIVE_TAB);
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
    getData,       // Fetch all data for any entity
    createData,    // Create new item
    updateData,    // Update existing item
    deleteData,    // Delete existing item
    loading,
    error,
  } = useFetchData<any>({
    getAll: {
      loads: getloads,
    },
    create: {
      ageRefresh: refreshAgeforLoad,
    },
    update: {
      load: updateLoadStatus,
    },
    remove: {
      load: deleteLoad,
    }
  });

  // Fetch Load data
  const fetchLoadsData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}&status=${activeTab}`;

        //Search Functionality
       if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }
        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getData("loads",query);
        if (result.success) {
          const loadData = result.data as Load[];

          // setCustomers(result.data as User[]);
          setLoads(loadData);
          updatePagination(result.meta as PaginationState);
        } else {
          toast.error(result.message || "Failed to fetch customers.");
        }
      } catch (err) {
        toast.error("Error fetching customer data.");
      }
    },
    [getData, searchQuery, user, activeTab, sortConfig]
  );

  const refreshAgeCall = async (data: any) => {
    const result = await createData("ageRefresh", data);
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
    localStorage.setItem(LOAD_ACTIVE_TAB, activeTab);
  }, [activeTab]);

  const columns = [
    {
      width: "80px",
      key: "age",
      label: "Age",
      sortable: true,
      render: (row: any) => <strong>{row.age}</strong>,
    },
    {
      width: "95px",
      key: "loadNumber",
      label: "Ref No",
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
    { width: "130px", key: "equipment", label: "Equipment", sortable: true },
    { width: "100px", key: "miles", label: "Miles", sortable: true },
    {
      width: "90px",
      key: "truckMatch",
      label: "Matches",
      render: (row: any) => (
        <Link
          to={`../truck/matches/${row._id}`}
          className="link-accent text-decoration-none fw-bold"
        >
          View
        </Link>
      ),
    },
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
          const result = await updateData("load",row._id, {
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
          const result = await updateData("load",row._id, {
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
          const result = await updateData("load", row._id, {
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
          const result = await updateData("load", row._id, {
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
          const result = await deleteData("load",row._id);
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
      equipment:  getEnumValue(Equipment, load.equipment), 
      miles: load.miles ? `${formatNumber(load.miles)} mi` : "N/A",
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
        const ids: string[] = [];
        selectedData.map((item: any) => ids.push(item._id));
        refreshAgeCall({ ids });
        break;
      case "Notify Carrier":
        const loadIds: string[] = [];
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
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">SPLS Load Board</h2>
        <button
            className="btn btn-accent d-flex align-items-center ms-auto"
            type="button"
            onClick={() => navigate(`create`)}
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
              { label: "Ref No", value: "loadNumber" },
              { label: "Equipment", value: "equipment" },
              { label: "Weight", value: "weight" }, 
              { label: "Width", value: "width" }, 
              { label: "Height", value: "height" },
              { label: "Broker Rate", value: "allInRate" }, 
              { label: "Customer Rate", value: "customerRate" }, 
              { label: "Commodity", value: "commodity" },
              { label: "Load Option", value: "loadOption" },
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
                            onClick={() => setActiveTab(LoadStatus.InTransit)}
                          >
                            <a
                              className={`nav-link ${
                                LoadStatus.InTransit == activeTab && "active"
                              }`}
                              href="#"
                            >
                              In Transit
                            </a>
                          </li>
                          <li
                            className="nav-item"
                            onClick={() => setActiveTab(LoadStatus.Delivered)}
                          >
                            <a
                              className={`nav-link ${
                                LoadStatus.Delivered == activeTab && "active"
                              }`}
                              href="#"
                            >
                              Delivered
                            </a>
                          </li>
                          <li
                            className="nav-item"
                            onClick={() => setActiveTab(LoadStatus.Completed)}
                          >
                            <a
                              className={`nav-link ${
                                LoadStatus.Completed == activeTab && "active"
                              }`}
                              href="#"
                            >
                              Completed
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
