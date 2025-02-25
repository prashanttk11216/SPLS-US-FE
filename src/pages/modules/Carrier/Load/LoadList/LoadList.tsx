import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import { toast } from "react-toastify";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  PaginationState,
} from "../../../../../components/common/Pagination/Pagination";
import "./LoadList.scss";
import { Load } from "../../../../../types/Load";
import {
  getloads,
  sendLoadRequest,
} from "../../../../../services/load/loadServices";
import { formatDate } from "../../../../../utils/dateFormat";
import LoadDetailsModal from "../LoadDetailsModal/LoadDetailsModal";
import PlaceAutocompleteField from "../../../../../components/PlaceAutocompleteField/PlaceAutocompleteField";
import NumberInput from "../../../../../components/common/NumberInput/NumberInput";
import { useForm } from "react-hook-form";
import arrowRightArrowLeft from "../../../../../assets/icons/arrowRightArrowLeft.svg";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import { equipmentOptions } from "../../../../../utils/dropdownOptions";
import { formatNumber } from "../../../../../utils/numberUtils";
import { Equipment } from "../../../../../enums/Equipment";
import { getEnumValue } from "../../../../../utils/globalHelper";

const LoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [loads, setLoads] = useState<Load[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [formQuery, setFormQuery] = useState<string | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [loadDetails, setLoadDetails] = useState<Partial<Load> | null>(null);

  const { handleSubmit, control, setValue, getValues, reset } = useForm<any>({
    mode: "onBlur",
  });

  

  const { getData, updateData, loading, error } = useFetchData<any>({
    getAll: { 
      load: getloads,
     },
     update: {
      load: sendLoadRequest,
     },
  });

  // Fetch Load data
  const fetchLoadsData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}`;

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }
        if (formQuery) {
          query += `&${formQuery}`;
        }

        const result = await getData("load", query);
        if (result.success) {
          const loadData = result.data as Load[];

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
    [getData, user, sortConfig, formQuery]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoadsData();
    }
  }, [user, sortConfig, formQuery]);

  const columns = [
    {
      width: "95px",
      key: "loadNumber",
      label: "Ref No",
      sortable: true,
    },
    { width: "150px", key: "origin", label: "Origin", sortable: true },
    ...(loads.some((load) => load.dhoDistance) // Add column conditionally
      ? [{ width: "75px", key: "dhoDistance", label: "DHO" }]
      : []),
    {
      width: "150px",
      key: "destination",
      label: "Destination",
      sortable: true,
    },
    ...(loads.some((load) => load.dhdDistance) // Add column conditionally
      ? [{ width: "75px", key: "dhdDistance", label: "DHD" }]
      : []),
    {
      width: "120px",
      key: "originEarlyPickupDate",
      label: "Pick-up",
      sortable: true,
    },
    { width: "130px", key: "equipment", label: "Equipment", sortable: true },
    { width: "100px", key: "miles", label: "Miles", sortable: true },
    { width: "100px", key: "postedBy", label: "Posted By" },
    { width: "120px", key: "allInRate", label: "Broker Rate", sortable: true },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Send Request":
        const result = await updateData("load", row._id, "");
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

  const getActionsForLoad = (_: Load): string[] => {
    const actions = ["View Details", "Send Request"];
    return actions;
  };

  const handlePageChange = (page: number) => {
    fetchLoadsData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchLoadsData(1, limit);
  };

  const getRowData = () => {
    return loads.map((load) => {
      const row: any = {
        _id: load._id,
        origin: load.origin.str,
        dhoDistance: load.dhoDistance || "N/A", // Add dhoDistance conditionally
        destination: load.destination?.str || "N/A",
        dhdDistance: load.dhdDistance || "N/A", // Add dhdDistance conditionally
        originEarlyPickupDate:
          formatDate(load.originEarlyPickupDate, "MM/dd/yyyy") || "N/A",
        equipment:  getEnumValue(Equipment, load.equipment),   
        miles: load.miles ? `${formatNumber(load.miles)} mi` : "N/A",
        postedBy:
          load.brokerId && typeof load.brokerId === "object"
            ? load.brokerId.company
            : "N/A",
        allInRate: load.allInRate ? `$ ${formatNumber(load.allInRate)}` : "N/A",
        loadNumber: load.loadNumber
          ? `${formatNumber(+load.loadNumber)}`
          : "N/A",
        actions: getActionsForLoad(load),
      };

      // Remove dhoDistance if it doesn't exist
      if (!load.dhoDistance) {
        delete row.dhoDistance;
      }

      // Remove dhdDistance if it doesn't exist
      if (!load.dhdDistance) {
        delete row.dhdDistance;
      }

      return row;
    });
  };

  // View Details Option Added
  const openDetailsModal = (customerData: Partial<Load>) => {
    setLoadDetails(customerData);
    setIsDetailsModalOpen(true);
  };

  const handleSearchForm = (data: any) => {
    // Initialize query object
    const query: { [key: string]: any } = {};

    // Populate the query object based on data
    if (data.origin?.str) {
      query.originLat = data.origin?.lat;
      query.originLng = data.origin?.lng;
      query.dhoRadius = data.dhoRadius;
    }
    if (data.destination?.str) {
      query.destinationLat = data.destination?.lat;
      query.destinationLng = data.destination?.lng;
      query.dhdRadius = data.dhdRadius;
    }

    if (data.equipment) {
      query.equipment = data.equipment;
    }

    if (data.loadDateRange?.length > 0) {
      query.fromDate = data.loadDateRange[0]?.toISOString();
      query.toDate = data.loadDateRange[1]?.toISOString();
    }

    console.log(data);

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
    setFormQuery(queryString);
  };
  const resetForm = () => {
    reset({
      equipment: undefined,
      origin: undefined,
      destination: undefined,
      dhoRadius: undefined,
      dhdRadius: undefined,
    });
    setFormQuery(null);
  };

  const swapAddress = () => {
    const origin = getValues("origin");
    const dhoRadius = getValues("dhoRadius");
    const destination = getValues("destination");
    const dhdRadius = getValues("dhdRadius");
    reset({
      origin: destination,
      dhoRadius: dhdRadius,
      destination: origin,
      dhdRadius: dhoRadius,
    });
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">SPLS Load Board</h2>
      <form onSubmit={handleSubmit(handleSearchForm)}>
        <div className="d-flex align-items-center">
          {/* Origin */}
          <div style={{ width: "200px" }}>
            <PlaceAutocompleteField
              name="origin"
              label=""
              control={control}
              placeholder="Origin"
              setValue={setValue} 
            />
          </div>
          {/* DH-O */}
          <div style={{ width: "90px" }} className="ms-2">
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
          <img
            src={arrowRightArrowLeft}
            height={20}
            width={20}
            className="mx-3 mb-3"
            onClick={swapAddress}
          />
          {/* Destination */}
          <div style={{ width: "200px" }}>
            <PlaceAutocompleteField
              name="destination"
              label=""
              control={control}
              placeholder="Destination"
              setValue={setValue}
            />
          </div>
          {/* DH-D */}
          <div style={{ width: "90px" }} className="ms-2">
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
          {/* Equipment */}
          <div style={{ width: "200px" }} className="mb-3 ms-2">
            <SelectField
              label=""
              name="equipment"
              placeholder="Select Equipment"
              control={control}
              options={equipmentOptions}
            />
          </div>
          <div style={{ width: "270px" }} className="mb-3 ms-2">
            <DateInput
              name="loadDateRange"
              control={control}
              label=""
              required={true}
              isRange={true}
              placeholder="Choose a date range"
              datePickerProps={{
                dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
                isClearable: true,
                selectsRange: true,
              }}
            />
          </div>
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
      </form>

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
