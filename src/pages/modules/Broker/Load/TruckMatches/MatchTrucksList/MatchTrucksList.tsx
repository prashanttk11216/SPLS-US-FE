import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Truck } from "../../../../../../types/Truck";
import { RootState } from "../../../../../../store/store";
import useFetchData from "../../../../../../hooks/useFetchData/useFetchData";
import { getMatchesTrucks } from "../../../../../../services/truck/truckService";
import { toast } from "react-toastify";
import Loading from "../../../../../../components/common/Loading/Loading";
import Table from "../../../../../../components/common/Table/Table";
import Pagination, {
  PaginationState,
} from "../../../../../../components/common/Pagination/Pagination";
import TruckDetailsModal from "../../../../Carrier/Truck/TruckDetailsModal/TruckDetailsModal";
import { UserRole } from "../../../../../../enums/UserRole";
import { formatDate } from "../../../../../../utils/dateFormat";
import { useParams } from "react-router-dom";
import { getEnumValue } from "../../../../../../utils/globalHelper";
import { Equipment } from "../../../../../../enums/Equipment";
import { hasAccess } from "../../../../../../utils/permissions";
import usePagination from "../../../../../../hooks/usePagination";

const MatcheTrucksList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { loadId } = useParams();
  const [trucks, setTruck] = useState<Truck[]>([]);
  const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "age", direction: "desc" });

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [truckDetails, setTruckDetails] = useState<Partial<Truck> | null>(null);

  const { getDataById, loading } = useFetchData<any>({
    getById: {
      truck: getMatchesTrucks,
    },
  });

  const fetchTrucksData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?&page=${page}&limit=${limit}`;

        if (hasAccess(user.roles, { roles: [UserRole.BROKER_USER] })) {
          query += `&brokerId=${user._id}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getDataById("truck", loadId!, query);
        if (result.success) {
          const userData = result.data as Truck[];

          // setCustomers(result.data as User[]);
          setTruck(userData);
          updatePagination(result.meta);
        }
      } catch (err) {
        toast.error("Error fetching Consignee data.");
      }
    },
    [getDataById, user, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchTrucksData();
    }
  }, [user, sortConfig, loadId]);

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
    const actions = ["View Details"];
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
    ...(trucks.some((truck) => truck.dhoDistance) // Add column conditionally
      ? [{ width: "75px", key: "dhoDistance", label: "DHO" }]
      : []),
    {
      width: "150px",
      key: "destination.str",
      label: "Destination",
      sortable: true,
    },
    ...(trucks.some((truck) => truck.dhdDistance) // Add column conditionally
      ? [{ width: "75px", key: "dhdDistance", label: "DHD" }]
      : []),
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
    return trucks.map((truck) => {
      const row: any = {
        _id: truck._id,
        age: truck.formattedAge || "N/A",
        referenceNumber: truck.referenceNumber || "N/A",
        "origin.str": truck.origin.str,
        dhoDistance: truck.dhoDistance || "N/A", // Add dhoDistance conditionally
        "destination.str": truck?.destination?.str || "Anywhere",
        dhdDistance: truck.dhdDistance || "N/A", // Add dhoDistance conditionally
        availableDate: formatDate(truck.availableDate, "MM/dd/yyyy") || "N/A",
        equipment: getEnumValue(Equipment, truck.equipment),
        allInRate: truck.allInRate ? `${truck.allInRate} $` : "N/A",
        weight: (truck.weight && truck.weight + " lbs") || "N/A",
        length: (truck.length && truck.length + " ft") || "N/A",
        actions: getActions(truck),
      };

      // Remove dhoDistance if it doesn't exist
      if (!truck.dhoDistance) {
        delete row.dhoDistance;
      }

      // Remove dhdDistance if it doesn't exist
      if (!truck.dhdDistance) {
        delete row.dhdDistance;
      }

      return row;
    });
  };

  return (
    <div className="consignee-list-wrapper">
      <h2 className="fw-bolder">Trucks</h2>

      {loading ? (
        <Loading />
      ) : (
        <>
          <h4 className="fw-bold">({trucks.length || "0"}) Matching Trucks</h4>
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

      <TruckDetailsModal
        isOpen={isDetailsModalOpen}
        truckData={truckDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default MatcheTrucksList;
