import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
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
import {
  getloads,
  sendLoadRequest,
} from "../../../../../services/load/loadServices";
import { formatDate } from "../../../../../utils/dateFormat";
import { formatDistance } from "../../../../../utils/distanceCalculator";
import LoadDetailsModal from "../LoadDetailsModal/LoadDetailsModal";

const LoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [loads, setLoads] = useState<Load[]>([]);
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
   const [loadDetails, setLoadDetails] = useState<Partial<Load> | null>(
     null
   );

  const {
    fetchData: fetchLoads,
    updateData: loadRequest,
    loading,
    error,
  } = useFetchData<any>({
    updateDataService: sendLoadRequest,
    fetchDataService: getloads,
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
    [fetchLoads, searchQuery, user, sortConfig]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoadsData();
    }
  }, [user, searchQuery, sortConfig]);

  const columns = [
    { key: "origin", label: "Origin", width: "20%"},
    { key: "destination", label: "Destination" },
    { key: "originEarlyPickupDate", label: "Pick-up", sortable: true },
    { key: "originEarlyPickupTime", label: "Pick-up Time", sortable: true },
    { key: "equipment", label: "Equipment"},
    { key: "miles", label: "Miles", sortable: true },
    { key: "mode", label: "Mode" },
    { key: "postedBy", label: "Posted By" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row)
        break;
      case "Send Request":
        const result = await loadRequest(row._id, "");
        if (result.success) {
          toast.success(result.message);
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

  const getActionsForLoad = (load: Load): string[] => {
    const actions = ["View Details","Send Request"];
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
      destination: load.destination?.str || "N/A",
      originEarlyPickupDate:
        formatDate(load.originEarlyPickupDate, "MM/dd/yyyy") || "N/A",
      originEarlyPickupTime:
        formatDate(load.originEarlyPickupDate, "h:mm aa") || "N/A",
      equipment: load.equipment || "N/A",
      miles: formatDistance(load.miles!) || "N/A",
      mode: load.mode || "N/A",
      postedBy:
        load.brokerId && typeof load.brokerId === "object"
          ? load.brokerId.company
          : "N/A",
      actions: getActionsForLoad(load),
    }));
  };

    // View Details Option Added
    const openDetailsModal = (customerData: Partial<Load>) => {
      setLoadDetails(customerData);
      setIsDetailsModalOpen(true);
    };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };


  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">SPLS Load Board</h2>
      <div className="d-flex align-items-center my-3">
        {/* Search Bar */}
        <div className="searchbar-container">
          <SearchBar onSearch={handleSearch} />
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
