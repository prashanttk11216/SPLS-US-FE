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
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import {
  exportLoads,
  getloads,
} from "../../../../../services/dispatch/dispatchServices";
import { formatDate } from "../../../../../utils/dateFormat";
import { DispatchLoadStatus } from "../../../../../enums/DispatchLoadStatus";
import { IDispatch } from "../../../../../types/Dispatch";
// import DispatchDetailsModal from "../DispatchDetailsModal/DispatchDetailsModal";
import { useForm } from "react-hook-form";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import { saveAs } from "file-saver";
import { downloadExcelFile } from "../../../../../utils/excelUtils";
import usePagination from "../../../../../hooks/usePagination";


const AccountingLoadExport: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { control, getValues, reset } = useForm<any>();

  const [loads, setLoads] = useState<IDispatch[]>([]);
   const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("loadNumber");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "age", direction: "desc" });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [dispatchDetails, setDispatchDetails] =
    useState<Partial<IDispatch> | null>(null);

  const [dateField, setDateField] = useState<string>("consignee.date"); // Default to "Delivery Date"

  const openDetailsModal = (dispatchData: Partial<IDispatch>) => {
    setDispatchDetails(dispatchData);
    setIsDetailsModalOpen(true);
  };


  const { getData,createData, loading, error } = useFetchData<any>({
    getAll: { 
      load: getloads,
     },
     create: {
      load: exportLoads
     }
  });

  // Fetch Load data
  const fetchLoadsData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}&status=${DispatchLoadStatus.Invoiced}`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }

        // Date Range Filter
        if (dateField && getValues("dateRange")) {
          const dateRange = getValues("dateRange");
          query += `&dateField=${dateField}`;
          if(dateRange[0]){
            query += `&fromDate=${dateRange[0].toISOString()}`
          }
          if(dateRange[1]){
            query += `&toDate=${dateRange[1].toISOString()}`
          }
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }
        
        const result = await getData("load", query);
        if (result.success) {
          const loadData = result.data as IDispatch[];

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
    [getData, searchQuery, user, sortConfig, dateField]
  );

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoadsData();
    }
  }, [
    user,
    searchQuery,
    sortConfig,
  ]);

  const columns = [
    
    {
      width: "100px",
      key: "loadNumber",
      label: "Ref No",
      sortable: true,
    },
    {
      width: "100px",
      key: "WONumber",
      label: "W/O",
      sortable: true,
    },
    {
      width: "130px",
      key: "invoiceNumber",
      label: "Invoice No",
      sortable: true,
    },
    {
      width: "90px",
      key: "invoiceDate",
      label: "Invoice Date",
      sortable: true,
    },
    { width: "200px", key: "shipper.address", label: "Origin", sortable: true },
    {
      width: "200px",
      key: "consignee.address",
      label: "Destination",
      sortable: true,
    },
    {
      width: "120px",
      key: "shipper.date",
      label: "Ship Date",
      sortable: true,
    },
    {
      width: "120px",
      key: "consignee.date",
      label: "Del Date",
      sortable: true,
    },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const getActionsForLoad = (_: IDispatch): string[] => {
    const actions = ["View Details"];
    return actions;
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
      openDetailsModal(row);
    }
  };

  const handleSort = (
    sortStr: { key: string; direction: "asc" | "desc" } | null
  ) => {
    setSortConfig(sortStr); // Updates the sort query to trigger API call
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
      invoiceNumber: load?.invoiceNumber || "N/A",
      invoiceDate: load?.invoiceDate
      ? formatDate(load?.invoiceDate, "MM/dd/yyyy")
      : "N/A",
      "shipper.address": load?.shipper?.address?.str || "N/A",
      "consignee.address": load?.consignee?.address?.str || "N/A",
      "shipper.date": load?.shipper?.date
        ? formatDate(load?.shipper?.date, "MM/dd/yyyy")
        : "N/A",
      "consignee.date": load?.consignee?.date
        ? formatDate(load?.consignee?.date, "MM/dd/yyyy")
        : "N/A",

      WONumber: load?.WONumber || "N/A",
      loadNumber: load?.loadNumber || "N/A",
      actions: getActionsForLoad(load),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleGeneralAction = (action: any, selectedData: any) => {
    switch (action) {
      case "Exports Loads":
        const ids: string[] = [];
        selectedData.map((item: any) => ids.push(item._id));
        exportLoadsHandler({ ids });
        break;
      default:
        break;
    }
    console.log(`General Action: ${action}`, selectedData);
  };

  const resetFilter = () => {
    reset({
      dateRange: undefined,
    });
    fetchLoadsData();
  };

  const exportLoadsHandler = async (data: any) => {
      const result = await createData("load", data);
      if (result.success) {
        downloadExcelFile(result.data.data, `Loads.xlsx`);
        toast.success(result.message);
      }
  };

  return (
    <div className="customers-list-wrapper">
      <div className="d-flex align-items-center justify-content-between my-3">
        {/* Heading */}
        <h2 className="fw-bolder">Accounting Exports</h2>
      </div>
      <div className="d-flex align-items-center my-3">

        {/* Search Bar */}
        <div className="searchbar-container">
          <SearchBar
            onSearch={handleSearch}
            searchFieldOptions={[
              { label: "Ref No", value: "loadNumber" },
              { label: "W/O", value: "WONumber" },
              { label: "Equipment", value: "equipment" },
              { label: "Rate", value: "allInRate" },
              { label: "Shipper Weight", value: "shipper.weight" },
              { label: "Consignee Weight", value: "consignee.weight" },
            ]}
            defaultField={searchField}
            onSearchFieldChange={(value) => setSearchField(value.value)}
          />
        </div>

        {/* Date Field Select */}
        <div style={{ width: "170px" }} className="ms-2">
          <SelectField
            label=""
            name="dateField"
            placeholder="Select Date Field"
            control={control}
            options={[
              { label: "Delivery Date", value: "consignee.date" },
              { label: "Shipping Date", value: "shipper.date" },
            ]}
            onChangeOption={(value) => setDateField(value?.value!)}
            defaultValue={dateField}
          />
        </div>

        {/* Date Range Picker */}
        <div className="mx-2">
          <DateInput
            name="dateRange"
            control={control} // Pass the control object from react-hook-form
            isRange={true}
            required={true}
            datePickerProps={{
              dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
              isClearable: true,
              selectsRange: true
            }}
          />
        </div>

        <button className="btn btn-primary" onClick={()=>fetchLoadsData()}>
          Apply Filter
        </button>
        <button
            type="button"
            className="btn btn-outline-secondary ms-3"
            onClick={resetFilter}
          >
            Reset
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
            onRowClick={handleRowClick}
            onSort={handleSort}
            sortConfig={sortConfig}
            rowClickable={true}
            showCheckbox={true}
            tableActions={["Exports Loads"]}
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
      {/* {isDetailsModalOpen && (
        <DispatchDetailsModal
          isOpen={isDetailsModalOpen}
          dispatch={dispatchDetails}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default AccountingLoadExport;
