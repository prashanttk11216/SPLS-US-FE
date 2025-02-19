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
import {
  BOLforLoad,
  deleteLoad,
  getloads,
  invoicedforLoad,
  rateConfirmationforLoad,
  refreshAgeforLoad,
  updateLoadStatus,
} from "../../../../../services/dispatch/dispatchServices";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../../utils/dateFormat";
import { DispatchLoadStatus } from "../../../../../enums/DispatchLoadStatus";
import { IDispatch } from "../../../../../types/Dispatch";
import DispatchDetailsModal from "../DispatchDetailsModal/DispatchDetailsModal";
import { useForm } from "react-hook-form";
import DateInput from "../../../../../components/common/DateInput/DateInput";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import { Equipment } from "../../../../../enums/Equipment";
import { downloadFile, getEnumValue } from "../../../../../utils/globalHelper";
import { hasAccess } from "../../../../../utils/permissions";
import FileUploadModal from "../../../../../components/common/FileUploadModal/FileUploadModal";

const DispatchLoadList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const { control, getValues, reset } = useForm<any>();

  const [loads, setLoads] = useState<IDispatch[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  }); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("loadNumber");
  const savedActiveTab = localStorage.getItem("dispatchActiveTab");
  const [activeTab, setActiveTab] = useState<DispatchLoadStatus>(
    savedActiveTab
      ? (savedActiveTab as DispatchLoadStatus)
      : DispatchLoadStatus.Published
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "age", direction: "desc" });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [dispatchDetails, setDispatchDetails] =
    useState<Partial<IDispatch> | null>(null);

  const [dateField, setDateField] = useState<string>("consignee.date"); // Default to "Delivery Date"

  const openDetailsModal = (dispatchData: Partial<IDispatch>) => {
    setDispatchDetails(dispatchData);
    setIsDetailsModalOpen(true);
  };

  const { getData, updateData, deleteData, loading, error } = useFetchData<any>(
    {
      getAll: {
        load: getloads,
      },
      update: {
        load: updateLoadStatus,
      },
      remove: {
        load: deleteLoad,
      },
    }
  );

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
          setMeta(result.meta as Meta);
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
    localStorage.setItem("dispatchActiveTab", activeTab);
  }, [activeTab]);

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

  const getActionsForLoad = (_: IDispatch): string[] => {
    const actions = ["View Details", "Edit"];
    if (activeTab == DispatchLoadStatus.Draft) {
      actions.push(DispatchLoadStatus.Published);
    }
    if (activeTab == DispatchLoadStatus.Published) {
      actions.push(DispatchLoadStatus.InTransit);
      actions.push("Print Rate & Confimation");
    }
    if (activeTab == DispatchLoadStatus.InTransit) {
      actions.push(DispatchLoadStatus.Delivered);
    }
    if (activeTab == DispatchLoadStatus.Delivered) {
      actions.push(DispatchLoadStatus.Completed);
    }
    if (activeTab == DispatchLoadStatus.Completed) {
      actions.push(DispatchLoadStatus.Invoiced);
    }
    if (activeTab == DispatchLoadStatus.Invoiced) {
      actions.push(DispatchLoadStatus.InvoicedPaid);
    }
    actions.push("Upload Documents");
    actions.push(DispatchLoadStatus.Cancelled);
    actions.push("Delete");
    return actions;
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;

      case "Edit":
        navigate(
          `create/${row._id}${
            activeTab === DispatchLoadStatus.Draft ? "?draft=true" : ""
          }`
        );
        break;

      case DispatchLoadStatus.Published:
      case DispatchLoadStatus.InTransit:
      case DispatchLoadStatus.Delivered:
      case DispatchLoadStatus.Completed:
      case DispatchLoadStatus.Invoiced:
      case DispatchLoadStatus.InvoicedPaid:
      case DispatchLoadStatus.Cancelled:
        try {
          const result = await updateData("load", row._id, { status: action });
          if (result.success) {
            toast.success(result.message);
            fetchLoadsData();
          } else {
            toast.error(result.message);
          }
        } catch (err) {
          toast.error(`Failed to update status to ${action}.`);
        }
        break;

      case "Print Rate & Confirmation":
        // Implement print logic
        printRateAndConfirmation(row);
        break;

      case "Upload Documents":
        // Implement document upload logic
        uploadDocuments(row);
        break;

      case "Delete":
        try {
          const result = await deleteData("load", row._id);
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
      age: load?.formattedAge || "N/A",
      "shipper.address": load?.shipper?.address?.str || "N/A",
      "consignee.address": load?.consignee?.address?.str || "N/A",
      "shipper.date": load?.shipper?.date
        ? formatDate(load?.shipper?.date, "MM/dd/yyyy")
        : "N/A",
      "consignee.date": load?.consignee?.date
        ? formatDate(load?.consignee?.date, "MM/dd/yyyy")
        : "N/A",

      equipment: getEnumValue(Equipment, load.equipment),
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
      case "Refresh Loads":
        const ids: string[] = [];
        selectedData.map((item: any) => ids.push(item._id));
        refreshAgeCall({ ids });
        break;
      default:
        break;
    }
  };

  const resetFilter = () => {
    reset({
      dateRange: undefined,
    });
    fetchLoadsData();
  };

  const downloadPDF = async (
    fetchFunction: Function,
    id: string,
    fileName: string
  ) => {
    try {
      let result: any = await fetchFunction(id);
      if (result) {
        const blob = new Blob([result], { type: "application/pdf" });
        downloadFile(blob, `${fileName}.pdf`);
      }
    } catch (err) {
      toast.error("Error downloading pdf.");
    }
  };

  const printRateAndConfirmation = async (row: Record<string, any>) => {
    await downloadPDF(
      rateConfirmationforLoad,
      "678129965f153c7d2668a498",
      "rate_confirmation"
    );
  };

  const uploadDocuments = (row: Record<string, any>) => {
    // Implement document upload logic
    setIsUploadModalOpen(true);
    setDispatchDetails(row);
  };

  return (
    <div className="customers-list-wrapper">
      <div className="d-flex align-items-center justify-content-between my-3">
        {/* Heading */}
        <h2 className="fw-bolder">SPLS Dispatch Board</h2>

        {/* Buttons */}
        <div className="d-flex align-items-center">
          <button
            className="btn btn-accent d-flex align-items-center"
            type="button"
            onClick={() => navigate(`create`)}
          >
            <img src={PlusIcon} height={16} width={16} className="me-2" />
            New Active Load
          </button>
          <button
            className="btn btn-accent d-flex align-items-center ms-2"
            type="button"
            onClick={() => navigate(`create?draft=true`)}
          >
            <img src={PlusIcon} height={16} width={16} className="me-2" />
            New Pending Load
          </button>
        </div>
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
              selectsRange: true,
            }}
          />
        </div>

        <button className="btn btn-primary" onClick={() => fetchLoadsData()}>
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
          {hasAccess(user.roles, { roles: [UserRole.BROKER_ADMIN] }) && (
            <ul className="nav nav-tabs">
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.Published)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.Published == activeTab && "active"
                  }`}
                  aria-current="page"
                  href="#"
                >
                  Loads
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.Draft)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.Draft == activeTab && "active"
                  }`}
                  href="#"
                >
                  Pending/Draft
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.InTransit)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.InTransit == activeTab && "active"
                  }`}
                  href="#"
                >
                  In Transit
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.Delivered)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.Delivered == activeTab && "active"
                  }`}
                  href="#"
                >
                  Delivered
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.Completed)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.Completed == activeTab && "active"
                  }`}
                  href="#"
                >
                  Completed
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.Invoiced)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.Invoiced == activeTab && "active"
                  }`}
                  href="#"
                >
                  Invoiced
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.InvoicedPaid)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.InvoicedPaid == activeTab && "active"
                  }`}
                  href="#"
                >
                  Invoiced Paid
                </a>
              </li>
              <li
                className="nav-item"
                onClick={() => setActiveTab(DispatchLoadStatus.Cancelled)}
              >
                <a
                  className={`nav-link ${
                    DispatchLoadStatus.Cancelled == activeTab && "active"
                  }`}
                  href="#"
                >
                  Cancelled
                </a>
              </li>
            </ul>
          )}
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
          loadId={dispatchDetails?._id}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DispatchLoadList;
