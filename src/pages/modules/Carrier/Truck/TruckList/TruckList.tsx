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
import { Truck } from "../../../../../types/Truck";
import {
  deleteTruck,
  getTrucks,
} from "../../../../../services/truck/truckService";
import CreateOrEditTruck from "../CreateOrEditTruck/CreateOrEditTruck";
import TruckDetailsModal from "../TruckDetailsModal/TruckDetailsModal";
import { formatDate } from "../../../../../utils/dateFormat";
import { formatNumber } from "../../../../../utils/numberUtils";
import { getEnumValue } from "../../../../../utils/globalHelper";
import { Equipment } from "../../../../../enums/Equipment";

const TruckList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [truckData, setTruckData] = useState<Partial<Truck> | null>(null);
  const [trucks, setTruck] = useState<Truck[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("referenceNumber");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "age", direction: "desc" });

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [truckDetails, setTruckDetails] = useState<Partial<Truck> | null>(null);


  const { getData, deleteData, loading } = useFetchData<any>({
    getAll: { 
      truck: getTrucks,
     },
     remove: {
      truck: deleteTruck
     }
  });

  const fetchTrucksData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?&page=${page}&limit=${limit}`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }

        if (user.role === UserRole.BROKER_USER) {
          query += `&brokerId=${user._id}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getData("truck", query);
        if (result.success) {
          const userData = result.data as Truck[];

          // setCustomers(result.data as User[]);
          setTruck(userData);
          setMeta(result.meta as Meta);
        } else {
          toast.error(result.message || "Failed to fetch Consignee Users.");
        }
      } catch (err) {
        toast.error("Error fetching Consignee data.");
      }
    },
    [getData, searchQuery, user, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchTrucksData();
    }
  }, [user, searchQuery, sortConfig]);

  const openCreateModal = () => {
    setIsEditing(false);
    setTruckData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (data: Partial<Truck>) => {
    setIsEditing(true);
    setTruckData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTruckData(null);
  };

  // View Details Option Added
  const openDetailsModal = (truckData: Partial<Truck>) => {
    setTruckDetails(truckData);
    setIsDetailsModalOpen(true);
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Edit":
        try {
          openEditModal(row);
        } catch {
          toast.error("Failed to fetch user details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deleteData("truck", row._id);
          if (result.success) {
            toast.success(result.message);
            fetchTrucksData();
          }
        } catch {
          toast.error("Failed to delete Consignee.");
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

  const getActions = (_: Truck): string[] => {
    const actions = ["View Details", "Edit", "Delete"];
    return actions;
  };

  const columns = [
    {
      width: "90px",
      key: "age",
      label: "Age",
      sortable: true,
      render: (row: any) => <strong>{row.age}</strong>,
    },
    {
      width: "130px",
      key: "referenceNumber",
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
      width: "150px",
      key: "availableDate",
      label: "Available Date",
      sortable: true,
    },
    { width: "150px", key: "equipment", label: "Equipment", sortable: true },
    { width: "140px", key: "allInRate", label: "All-in Rate", sortable: true },
    { width: "120px", key: "weight", label: "Weight", sortable: true },
    { width: "120px", key: "length", label: "Length", sortable: true },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handlePageChange = (page: number) => {
    fetchTrucksData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchTrucksData(1, limit);
  };

  const getRowData = () => {
    return trucks.map((truck) => ({
      _id: truck._id,
      age: truck.formattedAge || "N/A",
      referenceNumber: truck.referenceNumber
        ? formatNumber(truck.referenceNumber)
        : "N/A",
      "origin.str": truck.origin.str,
      "destination.str": truck?.destination?.str || "Anywhere",
      availableDate: formatDate(truck.availableDate, "MM/dd/yyyy") || "N/A",
      equipment:  getEnumValue(Equipment, truck.equipment),   
      allInRate: truck.allInRate
      ? `$ ${formatNumber(truck.allInRate)}`
      : "N/A",
      weight: truck.weight ? `${formatNumber(truck.weight)} lbs` : "N/A",
      length: truck.length ? `${formatNumber(truck.length)} ft` : "N/A",
      actions: getActions(truck),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="consignee-list-wrapper">
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">Trucks</h2>
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
            onSearch={handleSearch}
            searchFieldOptions={[
              { label: "Ref No", value: "referenceNumber" },
              { label: "Equipment", value: "equipment" },
              { label: "All-in Rate", value: "allInRate" }, 
              { label: "Weight", value: "weight" }, 
              { label: "Length", value: "length" }, 
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
            data={trucks}
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

      <CreateOrEditTruck
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchTrucksData();
        }}
        isEditing={isEditing}
        truckData={truckData}
      />

      <TruckDetailsModal
        isOpen={isDetailsModalOpen}
        truckData={truckDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default TruckList;
