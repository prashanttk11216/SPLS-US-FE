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
import { formatDate } from "../../../../../../utils/dateFormat";
import { useParams } from "react-router-dom";
import { getEnumValue } from "../../../../../../utils/globalHelper";
import { Equipment } from "../../../../../../enums/Equipment";
import usePagination from "../../../../../../hooks/usePagination";
import { SortOption } from "../../../../../../types/GeneralTypes";
import SearchBar from "../../../../../../components/common/SearchBar/SearchBar";
import NumberInput from "../../../../../../components/common/NumberInput/NumberInput";
import { useForm } from "react-hook-form";
import { VALIDATION_MESSAGES } from "../../../../../../constants/messages";

const searchFieldOptions = [
  { label: "Ref No", value: "referenceNumber" },
  { label: "Origin", value: "origin.str" },
  { label: "Destination", value: "destination.str" },
  { label: "Available Date", value: "availableDate" },
  { label: "Equipment", value: "equipment" },
  { label: "All-in Rate", value: "allInRate" },
  { label: "Weight", value: "weight" },
  { label: "Length", value: "length" },
]

type DestinationTypes={
  dhdRadius: number;
  dhoRadius: number;
}

const MatcheTrucksList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { loadId } = useParams();
  const [trucks, setTruck] = useState<Truck[]>([]);
  const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [sortConfig, setSortConfig] = useState<SortOption | null>({ key: "age", direction: "desc" });

  const [formQuery, setFormQuery] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("referenceNumber");

  // View Details Option Added
  const [details, setDetails] = useState<{
    isOpen: boolean;
    truck?: Partial<Truck>;
  }>({
    isOpen: false,
  });

  const { handleSubmit, control, reset } = useForm<DestinationTypes>({
    mode: "onBlur",
    defaultValues: {
      dhdRadius: 500,
      dhoRadius: 500
    }
  });

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

        if (formQuery) {
          query += `&${formQuery}`;
        }

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getDataById("truck", loadId!, query);
        if (result.success) {
          const userData = result.data as Truck[];
          setTruck(userData);
          updatePagination(result.meta as PaginationState);
        }
      } catch (err) {
        toast.error("Error fetching Consignee data.");
      }
    },
    [getDataById, user, searchQuery, formQuery, sortConfig]
  );

  useEffect(() => {
    if (user && user._id) {
      fetchTrucksData();
    }
  }, [user, sortConfig, searchQuery, formQuery, loadId]);

  const openDetailsModal = (truck: Partial<Truck>) =>
    setDetails({ isOpen: true, truck });
  const closeDetailsModal = () => setDetails({ isOpen: false });

  const handleAction = async (action: string, row: Partial<Truck>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const handleRowClick = async (row: Partial<Truck>) => {
    if (row) {
      openDetailsModal(row); // Open details modal
    }
  };

  const getActions = (): string[] => {
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
        availableDate: formatDate(truck.availableDate, "yyyy/MM/dd") || "N/A",
        equipment: getEnumValue(Equipment, truck.equipment),
        allInRate: truck.allInRate ? `${truck.allInRate} $` : "N/A",
        weight: (truck.weight && truck.weight + " lbs") || "N/A",
        length: (truck.length && truck.length + " ft") || "N/A",
        actions: getActions(),
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

  const handleSearchForm = (data: any) => {
    // Initialize query object
    const query: { [key: string]: any } = {};

    // Populate the query object based on data
    if (data.dhoRadius) {
      query.dhoRadius = data.dhoRadius;
    } else {
      query.dhoRadius = 500;
    }
    if (data.dhdRadius) {
      query.dhdRadius = data.dhdRadius;
    } else {
      query.dhdRadius = 500;
    }

    // Use URLSearchParams to generate the query string, excluding undefined fields
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        // Exclude undefined fields
        searchParams.append(key, value.toString());
      }
    });

    // Output the query string
    const queryString = `${searchParams.toString()}`;
    console.log(queryString);
    setFormQuery(queryString);
  };
  const resetForm = () => {
    reset({
      dhoRadius: 500,
      dhdRadius: 500,
    });
    setFormQuery(null);
  };

  return (
    <div className="consignee-list-wrapper">
      <h2 className="fw-bolder">Trucks</h2>

      {loading ? (
        <Loading />
      ) : (
        <>
          <h4 className="fw-bold">({trucks.length || "0"}) Matching Trucks</h4>
          <div className="d-flex my-3">
            <div className="searchbar-container">
              <SearchBar
                onSearch={(query: string) => setSearchQuery(query)}
                searchFieldOptions={searchFieldOptions}
                defaultField={searchField}
                onSearchFieldChange={(value) => setSearchField(value.value)}
              />
            </div>
            <form onSubmit={handleSubmit(handleSearchForm)}>
              <div className="d-flex">
                <div style={{ width: "120px" }} className="ms-2">
                  <NumberInput
                    label=""
                    id="dhoRadius"
                    name="dhoRadius"
                    placeholder="DH-O"
                    control={control}
                    rules={{
                      min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                    }}
                  />
                </div>
                <div style={{ width: "120px" }} className="ms-2 mx-2">
                  <NumberInput
                    label=""
                    id="dhdRadius"
                    name="dhdRadius"
                    placeholder="DH-D"
                    control={control}
                    rules={{
                      min: { value: 0, message: VALIDATION_MESSAGES.nonNegative },
                    }}
                  />
                </div>
                <div className="mb-3">
                  <button className="btn btn-primary" disabled={loading}>
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary ms-3"
                    disabled={loading}
                    onClick={resetForm}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
          <Table
            columns={columns}
            rows={getRowData()}
            data={trucks}
            onActionClick={handleAction}
            rowClickable={true}
            onSort={(sortStr: SortOption) => setSortConfig(sortStr)}

            sortConfig={sortConfig}
            onRowClick={handleRowClick}
          />
          <div className="pagination-container">
            {/* Pagination Component */}
            <Pagination
              meta={meta}
              onPageChange={(page: number) => fetchTrucksData(page)}
              onItemsPerPageChange={(limit: number) =>
                fetchTrucksData(1, limit)
              }
            />
          </div>
        </>
      )}

      <TruckDetailsModal
        isOpen={details.isOpen}
        truckData={details.truck}
        onClose={closeDetailsModal}
      />
    </div>
  );
};

export default MatcheTrucksList;
