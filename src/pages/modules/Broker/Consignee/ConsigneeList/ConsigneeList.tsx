import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import { toast } from "react-toastify";
import Loading from "../../../../../components/common/Loading/Loading";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import "./ConsigneeList.scss";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination, {
  PaginationState,
} from "../../../../../components/common/Pagination/Pagination";
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import { Consignee } from "../../../../../types/Consignee";
import {
  deleteConsignee,
  getConsignee,
  toggleActiveConsignee,
} from "../../../../../services/consignee/consigneeService";
import CreateOrEditConsignee from "../CreateOrEditConsignee/CreateOrEditConsignee";
import ConsigneeDetailsModal from "../ConsigneeDetailsModal/ConsigneeDetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";
import usePagination from "../../../../../hooks/usePagination";
import { SortOption } from "../../../../../types/GeneralTypes";

const ConsigneeList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [consigneeId, setConsigneeId] = useState<string>();
  const [consignees, setConsignee] = useState<Consignee[]>([]);
   const { meta, updatePagination } = usePagination(); // Pagination metadata

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<string>("email");
  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);

  // View Details Option Added
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [consigneeDetails, setConsigneeDetails] =
    useState<Partial<Consignee> | null>(null);



  const { getData, updateData, deleteData, loading } = useFetchData<any>({
    getAll: { 
      user: getConsignee,
     },
     update: {
      user: toggleActiveConsignee,
     },
     remove: {
      user: deleteConsignee,
     }
  });

  const fetchConsigneesData = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return;
      try {
        let query = `?&page=${page}&limit=${limit}&populate=brokerId,postedBy`;

        //Search Functionality
        if (searchQuery && searchField) {
          query += `&search=${encodeURIComponent(
            searchQuery
          )}&searchField=${searchField}`;
        }

        if (sortConfig) {
          query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
        }

        const result = await getData("user", query);
        if (result.success) {
          const userData = result.data as Consignee[];

          // setCustomers(result.data as User[]);
          setConsignee(userData);
          updatePagination(result.meta as PaginationState);
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
      fetchConsigneesData();
    }
  }, [user, searchQuery, sortConfig]);

  const openCreateModal = () => {
    setIsEditing(false);
    setConsigneeId('');
    setIsModalOpen(true);
  };

  const openEditModal = (_id: string) => {
    setIsEditing(true);
    setConsigneeId(_id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setConsigneeId('');
  };

  // View Details Option Added
  const openDetailsModal = (consigneeData: Partial<Consignee>) => {
    setConsigneeDetails(consigneeData);
    setIsDetailsModalOpen(true);
  };

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "View Details":
        handleRowClick(row);
        break;
      case "Edit":
        openEditModal(row._id);
        break;
      case "Delete":
        try {
          const result = await deleteData("user",row._id);
          if (result.success) {
            toast.success(result.message);
            fetchConsigneesData();
          }
        } catch {
          toast.error("Failed to delete Consignee.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateData("user", row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchConsigneesData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} Consignee.`);
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
    sortStr: SortOption | null
  ) => {
    setSortConfig(sortStr); // Updates the sort query to trigger API call
  };

  const getActions = (consignee: Consignee): string[] => {
    const actions = ["View Details", "Edit"];
    if (consignee.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Delete");
    return actions;
  };

  const columns = [
    { width: "250px", key: "name", label: "Name" },
    { width: "210px", key: "email", label: "Email", sortable: true },
    { width: "150px", key: "contact", label: "Contact", sortable: true },
    {
      width: "170px",
      key: "shippingHours",
      label: "Shipping Hours",
      sortable: true,
    },
    { width: "90px", key: "isActive", label: "Status", sortable: true },
    { width: "90px", key: "actions", label: "Actions", isAction: true },
  ];

  const handlePageChange = (page: number) => {
    fetchConsigneesData(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    fetchConsigneesData(1, limit);
  };

  const getRowData = () => {
    return consignees.map((consignee) => ({
      _id: consignee._id,
      name: `${consignee.firstName} ${consignee.lastName}`,
      email: consignee.email,
      contact: consignee.primaryNumber
        ? formatPhoneNumber(consignee.primaryNumber)
        : "N/A",
      shippingHours: consignee.shippingHours,
      isActive: consignee.isActive ? "Active" : "Inactive",
      actions: getActions(consignee),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="consignee-list-wrapper">
      <div className="d-flex align-items-center">
      <h2 className="fw-bolder">Consignees</h2>
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
              { label: "Email", value: "email" },
              { label: "Name", value: "name" },
              { label: "Shipping Hours", value: "shippingHours" },
              { label: "Contact", value: "primaryNumber" },
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
            data={consignees}
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

      {
        isModalOpen && <CreateOrEditConsignee
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchConsigneesData();
        }}
        isEditing={isEditing}
        consigneeId={consigneeId}
      />
      }

      
      {isDetailsModalOpen && <ConsigneeDetailsModal
        isOpen={isDetailsModalOpen}
        consignee={consigneeDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />}
    </div>
  );
};

export default ConsigneeList;
