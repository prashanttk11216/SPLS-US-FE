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
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import "./LoadList.scss";
import { Load } from "../../../../../types/Load";
import { getloads } from "../../../../../services/load/loadServices";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../../utils/dateFormat";
import LoadDetailsModal from "../LoadDetailsModal/LoadDetailsModal";
import { formatNumber } from "../../../../../utils/numberUtils";
import { LoadStatus } from "../../../../../enums/LoadStatus";
import { Equipment } from "../../../../../enums/Equipment";
import { getEnumValue } from "../../../../../utils/globalHelper";

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
  const [searchField, setSearchField] = useState<string>("loadNumber");

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [loadDetails, setLoadDetails] = useState<Partial<Load> | null>(null);

  
  const { getData, loading, error } = useFetchData<any>({
    getAll: { 
      load: getloads,
     },
  });

  // Fetch Load data
  const fetchLoadsData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }
        
        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getData("load", query);
        if (result.success) {
          const loadData = result.data as Load[];

          // setCustomers(result.data as User[]);
          setLoads(loadData);
          setMeta(result.meta as Meta);
        }
      } catch (err) {
        toast.error("Error fetching Loads data.");
      }
    },
    [getData, searchQuery, user, sortConfig]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoadsData();
    }
  }, [user, searchQuery, sortConfig]);

  const columns = [
    {
      width: "95px",
      key: "loadNumber",
      label: "Ref No",
      sortable: true,
    },
    { width: "160px", key: "origin", label: "Origin", sortable: true },
    {
      width: "160px",
      key: "destination",
      label: "Destination",
      sortable: true,
    },
    {
      width: "120px",
      key: "originEarlyPickupDate",
      label: "Pick-up",
      sortable: true,
    },
    { width: "130px", key: "equipment", label: "Equipment" },
    { width: "100px", key: "miles", label: "Miles", sortable: true },
    {
      width: "100px",
      key: "customerRate",
      label: "Rate",
      sortable: true,
    },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Edit":
        navigate(`load-board/create/${row._id}${row.status === LoadStatus.Draft ? "?draft=true" : ""}`);
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

  const getActionsForLoad = (load: Load): string[] => {
    const actions = ["View Details"];
    if (load.status == LoadStatus.Draft) {
          actions.push("Edit");
    }
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
      origin: load.origin.str,
      destination: load.destination.str || "N/A",
      originEarlyPickupDate:
        formatDate(load.originEarlyPickupDate, "MM/dd/yyyy") || "N/A",
      equipment:  getEnumValue(Equipment, load.equipment),   
      miles: load.miles ? `${formatNumber(load.miles)} mi` : "N/A",
      customerRate: load.customerRate
        ? `$ ${formatNumber(load.customerRate)}`
        : "N/A",
      loadNumber: load.loadNumber ? `${formatNumber(+load.loadNumber)}` : "N/A",
      actions: getActionsForLoad(load),
    }));
  };

  const openDetailsModal = (customerData: Partial<Load>) => {
    setLoadDetails(customerData);
    setIsDetailsModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="customers-list-wrapper">
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">SPLS Load Board</h2>
        <button
            className="btn btn-accent d-flex align-items-center ms-auto"
            type="button"
            onClick={() => navigate(`load-board/create`)}
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
              { label: "Distance", value: "miles" }, 
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
          <Table
            columns={columns}
            rows={getRowData()}
            data={loads}
            onActionClick={handleAction}
            rowClickable={true}
            onSort={handleSort}
            sortConfig={sortConfig}
            onRowClick={handleRowClick}
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
      <LoadDetailsModal
        isOpen={isDetailsModalOpen}
        load={loadDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default LoadList;
