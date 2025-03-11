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
import { SortOption } from "../../../../../types/GeneralTypes";
import Tabs from "../../../../../components/common/Tabs/Tabs";

const LOAD_ACTIVE_TAB = "LOAD_ACTIVE_TAB";

const SearchFieldOptions = [
  { label: "Ref No", value: "loadNumber" },
  { label: "Equipment", value: "equipment" },
  { label: "Weight", value: "weight" },
  { label: "Width", value: "width" },
  { label: "Height", value: "height" },
  { label: "Broker Rate", value: "allInRate" },
  { label: "Customer Rate", value: "customerRate" },
  { label: "Commodity", value: "commodity" },
  { label: "Load Option", value: "loadOption" },
];

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

const tabOptions = [
  { label: "Loads", value: LoadStatus.Published },
  { label: "Available/Draft", value: LoadStatus.Draft },
  { label: "Pending Response", value: LoadStatus.PendingResponse },
  { label: "Deal Closed", value: LoadStatus.DealClosed },
  { label: "In Transit", value: LoadStatus.InTransit },
  { label: "Delivered", value: LoadStatus.Delivered },
  { label: "Completed", value: LoadStatus.Completed },
  { label: "Cancelled", value: LoadStatus.Cancelled },
];

const LoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [loads, setLoads] = useState<Load[]>([]);
  const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("loadNumber");

  const savedActiveTab = localStorage.getItem(LOAD_ACTIVE_TAB);
  const [activeTab, setActiveTab] = useState<string>(
    savedActiveTab ? (savedActiveTab as LoadStatus) : LoadStatus.Published
  );
  const [sortConfig, setSortConfig] = useState<SortOption | null>({
    key: "age",
    direction: "desc",
  });
  const [details, setDetails] = useState<{
    isOpen: boolean;
    load?: Partial<Load>;
  }>({
    isOpen: false,
  });
  const [selectedLoad, setSelectedLoad] = useState<string | null>(null);
  const [selectedLoads, setSelectedLoads] = useState<string[] | null>(null);

  const { getData, createData, updateData, deleteData, loading, error } =
    useFetchData<any>({
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
      },
    });

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(LOAD_ACTIVE_TAB, activeTab);
      fetchLoads();
    }
  }, [user, searchQuery, activeTab, sortConfig]);

  // Fetch Load data
  const fetchLoads = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}&status=${activeTab}&populate=brokerId:-password,postedBy:-password,customerId:-password`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }
        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getData("loads", query);
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
        fetchLoads();
      }, 500);
    }
  };

  const updateLoadStatusHandler = async (
    id: string,
    status: LoadStatus,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const result = await updateData("load", id, { status });
      if (result.success) {
        toast.success(successMessage);
        fetchLoads();
      }else{
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(errorMessage);
    }
  };

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
        await updateLoadStatusHandler(
          row._id,
          LoadStatus.Published,
          "Load published successfully.",
          "Failed to update load status."
        );
        break;

      case LoadStatus.PendingResponse:
        await updateLoadStatusHandler(
          row._id,
          LoadStatus.PendingResponse,
          "Load status updated to Pending Response.",
          "Failed to update load status."
        );
        break;

      case LoadStatus.DealClosed:
        await updateLoadStatusHandler(
          row._id,
          LoadStatus.DealClosed,
          "Load deal closed successfully.",
          "Failed to update load status."
        );
        break;

      case LoadStatus.Cancelled:
        await updateLoadStatusHandler(
          row._id,
          LoadStatus.Cancelled,
          "Load cancelled successfully.",
          "Failed to update load status."
        );
        break;

      case "Notify Customer":
        setSelectedLoad(row._id);
        break;

      case "Delete":
        try {
          const result = await deleteData("load", row._id);
          if (result.success) {
            toast.success(result.message);
            fetchLoads();
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
      openDetailsModal(row);
    }
  };

  const getActionsForLoad = (): string[] => {
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

  const getRowData = () => {
    return loads.map((load) => ({
      _id: load._id,
      age: load.formattedAge || "N/A",
      "origin.str": load.origin.str,
      "destination.str": load.destination.str || "N/A",
      originEarlyPickupDate:
        formatDate(load.originEarlyPickupDate, "yyyy/MM/dd") || "N/A",
      equipment: getEnumValue(Equipment, load.equipment),
      miles: load.miles ? `${formatNumber(load.miles)} mi` : "N/A",
      loadNumber: load.loadNumber || "N/A",
      actions: getActionsForLoad(),
    }));
  };

  const handleGeneralAction = (action: any, selectedData: any) => {
    const ids: string[] = [];
    selectedData.map((item: any) => ids.push(item._id));
    switch (action) {
      case "Refresh Loads":
        refreshAgeCall({ ids });
        break;
      case "Notify Carrier":
        setSelectedLoads(ids);
        break;
      default:
        break;
    }
  };

  const openDetailsModal = (load: Partial<Load>) =>
    setDetails({ isOpen: true, load });
  const closeDetailsModal = () => setDetails({ isOpen: false });

  const closeLoadCreationModal = () => {
    setSelectedLoads(null);
    fetchLoads();
  };

  return (
    <div className="load-list-wrapper">
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
            onSearch={(query: string) => setSearchQuery(query)}
            searchFieldOptions={SearchFieldOptions}
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
          <Tabs
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <Table
            columns={columns}
            rows={getRowData()}
            data={loads}
            onActionClick={handleAction}
            onRowClick={handleRowClick}
            onSort={(sortStr: SortOption) => setSortConfig(sortStr)}
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
                onPageChange={(page: number) => fetchLoads(page)}
                onItemsPerPageChange={(limit: number) => fetchLoads(1, limit)}
              />
            </div>
          )}
        </>
      )}

      {selectedLoad && (
        <RateConfirmationNotification
          selectedLoad={selectedLoad}
          closeModal={() => setSelectedLoad(null)}
        />
      )}

      {selectedLoads && (
        <LoadCreationAlert
          selectedLoads={selectedLoads}
          closeModal={closeLoadCreationModal}
        />
      )}

      <LoadDetailsModal
        load={details.load}
        onClose={closeDetailsModal}
        isOpen={details.isOpen}
      />
    </div>
  );
};

export default LoadList;
