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
  BOLforLoad,
  deleteLoad,
  getloads,
  invoicedforLoad,
  refreshAgeforLoad,
  updateLoadStatus,
} from "../../../../../services/dispatch/dispatchServices";
import { formatDate } from "../../../../../utils/dateFormat";
import { DispatchLoadStatus } from "../../../../../enums/DispatchLoadStatus";
import { IDispatch } from "../../../../../types/Dispatch";
// import DispatchDetailsModal from "../DispatchDetailsModal/DispatchDetailsModal";
import { useForm } from "react-hook-form";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import { Equipment } from "../../../../../enums/Equipment";
import { downloadFile, getEnumValue, printContent } from "../../../../../utils/globalHelper";
import usePagination from "../../../../../hooks/usePagination";
import ConfirmationModal from "../../../../../components/common/ConfirmationModal/ConfirmationModal";
import { SortOption } from "../../../../../types/GeneralTypes";
import Tabs from "../../../../../components/common/Tabs/Tabs";
import FileUploadModal from "../../../../../components/common/FileUploadModal/FileUploadModal";
import DispatchDetailsModal from "../../DispatchLoad/DispatchDetailsModal/DispatchDetailsModal";

const ACCOUNTING_DISPATCH_ACTIVE_TAB = "ACCOUNTING_DISPATCH_ACTIVE_TAB";

const searchFieldOptions = [
  { label: "Ref No", value: "loadNumber" },
  { label: "W/O", value: "WONumber" },
  { label: "Equipment", value: "equipment" },
  { label: "Rate", value: "allInRate" },
  { label: "Shipper Weight", value: "shipper.weight" },
  { label: "Consignee Weight", value: "consignee.weight" },
];

const columns = [
  {
    width: "90px",
    key: "age",
    label: "Age",
    sortable: true,
    render: (row: any) => <strong>{row.age}</strong>,
  },
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
  { width: "130px", key: "equipment", label: "Equipment", sortable: true },
  { width: "90px", key: "actions", label: "Actions", isAction: true },
];

const tabOptions = [
  { label: "Delivered", value: DispatchLoadStatus.Delivered },
  { label: "Completed", value: DispatchLoadStatus.Completed },
  { label: "Invoiced", value: DispatchLoadStatus.Invoiced },
  { label: "Invoiced Paid", value: DispatchLoadStatus.InvoicedPaid },
  { label: "Cancelled", value: DispatchLoadStatus.Cancelled },
];

const AccountingDispatchLoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { control, getValues, reset } = useForm<any>();

  const [confirm, setConfirm] = useState<boolean>(false);
  const [item, setItem] = useState<any>({});
  const [loads, setLoads] = useState<IDispatch[]>([]);
  const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("loadNumber");
  const savedActiveTab = localStorage.getItem(ACCOUNTING_DISPATCH_ACTIVE_TAB);
  const [activeTab, setActiveTab] = useState<string>(
    savedActiveTab
      ? (savedActiveTab as DispatchLoadStatus)
      : DispatchLoadStatus.Delivered
  );
  const [sortConfig, setSortConfig] = useState<SortOption | null>({
    key: "age",
    direction: "desc",
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [dispatchDetails, setDispatchDetails] =
    useState<Partial<IDispatch> | null>(null);

  const [dateField, setDateField] = useState<string>("consignee.date"); // Default to "Delivery Date"
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  

  const openDetailsModal = (dispatchData: Partial<IDispatch>) => {
    setDispatchDetails(dispatchData);
    setIsDetailsModalOpen(true);
  };

  const { getData, loading, error } = useFetchData<any>({
    getAll: {
      load: getloads,
    },
    update: {
      load: updateLoadStatus,
    },
    remove: {
      load: deleteLoad,
    },
  });

  // Fetch Load data
  const fetchLoads = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        let query = `?page=${page}&limit=${limit}&status=${activeTab}&populate=brokerId:-password,postedBy:-password`;

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
          if (dateRange[0]) {
            query += `&fromDate=${dateRange[0].toISOString()}`;
          }
          if (dateRange[1]) {
            query += `&toDate=${dateRange[1].toISOString()}`;
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
    [getData, searchQuery, user, activeTab, sortConfig, dateField]
  );

  const refreshAgeCall = async (data: any) => {
    const result = await refreshAgeforLoad(data);
    if (result.success) {
      toast.success(result.message);
      setTimeout(() => {
        fetchLoads();
      }, 500);
    }
  };

  // Trigger fetch when user is populated
  useEffect(() => {
    if (user && user._id) {
      fetchLoads();
    }
  }, [user, searchQuery, activeTab, sortConfig]);

  // Update active tab in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ACCOUNTING_DISPATCH_ACTIVE_TAB, activeTab);
  }, [activeTab]);

  const getActionsForLoad = (_: IDispatch): string[] => {
    const actions = ["View Details"];

    if (activeTab == DispatchLoadStatus.Delivered) {
      actions.push("Print BOL");
    }
    if (activeTab == DispatchLoadStatus.Completed) {
      actions.push("Print Invoice");
    }
    actions.push("Upload Documents");
    return actions;
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Print BOL":
        // Implement print logic
        printBOL(row);
        break;

      case "Print Invoice":
        // Implement print logic
        printInvoice(row);
        break;

      case "Upload Documents":
        // Implement document upload logic
        uploadDocuments(row);
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

  const getRowData = () => {
    return loads.map((load) => ({
      _id: load._id,
      age: load?.formattedAge || "N/A",
      "shipper.address": load?.shipper?.address?.str || "N/A",
      "consignee.address": load?.consignee?.address?.str || "N/A",
      "shipper.date": load?.shipper?.date
        ? formatDate(load?.shipper?.date, "yyyy/MM/dd")
        : "N/A",
      "consignee.date": load?.consignee?.date
        ? formatDate(load?.consignee?.date, "yyyy/MM/dd")
        : "N/A",

      equipment: getEnumValue(Equipment, load.equipment),
      WONumber: load?.WONumber || "N/A",
      loadNumber: load?.loadNumber || "N/A",
      actions: getActionsForLoad(load),
    }));
  };

  const handleGeneralAction = (action: any, selectedData: any) => {
    switch (action) {
      case "Refresh Loads":
        const ids: string[] = [];
        selectedData.map((item: any) => ids.push(item._id));
        refreshAgeCall({ ids });
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
    fetchLoads();
  };

  const downloadPDF = async (
    fetchFunction: Function,
    id: string,
    fileName: string
  ) => {
    try {
      const result = await fetchFunction(id);
      if (result.success) {        
        // const blob = new Blob([result], { type: "application/pdf" }); 
        // downloadFile(blob, fileName);
        printContent(result.data.file);
        toast.success("Downloaded Successfully.");
      }else{
        toast.error("No matching loads found.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error downloading pdf.");
    }
  };

  const printBOL = async (row: Record<string, any>) => {
    await downloadPDF(BOLforLoad, row._id, `BOL_${row.loadNumber}.pdf`);
  };

  const handleConfirm = async (e: any) => {
    if (e) {
      await downloadPDF(
        invoicedforLoad,
        item._id,
        `Invoice_${item.loadNumber}.pdf`
      );
      setConfirm(false);
    }
  };

  const handleCancel = () => {
    setConfirm(false);
  };

  const printInvoice = (row: Record<string, any>) => {
    setItem(row);
    setConfirm(true);
  };

  // Implement document upload logic
  const uploadDocuments = (row: Record<string, any>) => {
    setIsUploadModalOpen(true);
    setDispatchDetails(row);
  };

  return (
    <div className="customers-list-wrapper">
      <div className="d-flex align-items-center justify-content-between my-3">
        {/* Heading */}
        <h2 className="fw-bolder">Accounting Manager</h2>
      </div>
      <div className="d-flex align-items-center my-3">
        {/* Search Bar */}
        <div className="searchbar-container">
          <SearchBar
            onSearch={(query: string) => setSearchQuery(query)}
            searchFieldOptions={searchFieldOptions}
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
              dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
              isClearable: true,
              selectsRange: true,
            }}
          />
        </div>

        <button className="btn btn-primary" onClick={() => fetchLoads()}>
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
      <ConfirmationModal
        title={"Print Invoice Confirmation"}
        description={
          "By continuing, an Invoice Number will be assigned to this load."
        }
        question={"Do you wish to continue?"}
        isOpen={confirm}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
      {isDetailsModalOpen && (
        <DispatchDetailsModal
          isOpen={isDetailsModalOpen}
          dispatch={dispatchDetails}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          multiple={true}
          dispatchDetails={dispatchDetails}
          onClose={() => {
            setIsUploadModalOpen(false);
            fetchLoads();
          }}
        />
      )}
    </div>
  );
};

export default AccountingDispatchLoadList;
