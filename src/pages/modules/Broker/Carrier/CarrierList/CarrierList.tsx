import React, { useCallback, useEffect, useState } from "react";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import Loading from "../../../../../components/common/Loading/Loading";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import {
  deleteUser,
  getUserById,
  getUsers,
  toggleActiveStatus,
} from "../../../../../services/user/userService";
import Avatar from "../../../../../components/common/Avatar/Avatar";
import { User } from "../../../../../types/User";
import Table from "../../../../../components/common/Table/Table";
import CreateOrEditCarrier from "../CreateOrEditCarrier/CreateOrEditCarrier";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";
import Pagination from "../../../../../components/common/Pagination/Pagination";

const CarrierList: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [carrierToEdit, setCarrierToEdit] = useState<Partial<User> | null>(null);
  const [carriers, setCarriers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Default items per page set to 10
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    fetchData: fetchCarriers,
    fetchDataById: fetchCarrier,
    deleteDataById: deleteCarrier,
    updateData: updateStatus,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    fetchByIdService: getUserById,
    deleteDataService: deleteUser,
    updateDataService: toggleActiveStatus,
  });

  // Fetch Carrier data
  const fetchCarrierData = useCallback(async () => {
    if (!user || !user._id) return; // Wait for user data
    try {
      let query = `?role=${UserRole.CARRIER}&page=${currentPage}&limit=${itemsPerPage}`;
      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }
      const result = await fetchCarriers(query);
      if (result.success && result.data) {
        setCarriers(result.data);
        setTotalItems(result.meta.totalItems);
      } else {
        toast.error(result.message || "Failed to fetch carriers.");
      }
    } catch (err) {
      toast.error("Error fetching carrier data.");
    }
  }, [fetchCarriers, user, currentPage, itemsPerPage]);

  // Use a single fetch on initial render and when currentPage, itemsPerPage, or user changes
  useEffect(() => {
    if (user && user._id) {
      fetchCarrierData();
    }
  }, [fetchCarrierData, user, currentPage, itemsPerPage]);

  const columns = [
    { key: "name", label: "Name", width: "40%" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleAction = async (action: string, row: Record<string, any>) => {
    switch (action) {
      case "Edit":
        try {
          const carrierData = await fetchCarrier(row._id);
          openEditModal(carrierData.data);
        } catch (err) {
          toast.error("Failed to fetch customer details for editing.");
        }
        break;
      case "Delete":
        try {
          const result = await deleteCarrier(row._id);
          if (result.success) {
            toast.success(result.message);
            fetchCarrierData();
          }
        } catch (err) {
          toast.error("Failed to delete customer.");
        }
        break;
      case "Activate":
      case "Deactivate":
        try {
          const result = await updateStatus(row._id, {});
          if (result.success) {
            toast.success(result.message);
            fetchCarrierData();
          }
        } catch {
          toast.error(`Failed to ${action.toLowerCase()} user.`);
        }
        break;
      default:
        toast.info(`Action "${action}" is not yet implemented.`);
    }
  };

  const getActionsForCarrier = (carrier: User): string[] => {
    const actions = ["Edit"];
    if (carrier.isActive) {
      actions.push("Deactivate");
    } else {
      actions.push("Activate");
    }
    actions.push("Delete");
    return actions;
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const getRowData = () => {
    return carriers.map((carrier) => ({
      _id: carrier._id,
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar
              avatarUrl={carrier.avatarUrl}
              firstName={carrier.firstName}
              lastName={carrier.lastName}
              email={carrier.email}
              size={35}
            />
          </div>
          <div className="name">{`${carrier.firstName} ${carrier.lastName}`}</div>
        </div>
      ),
      email: carrier.email,
      contact: carrier.primaryNumber || "N/A",
      company: carrier.company || "N/A",
      status: carrier.isActive ? "Active" : "Inactive",
      actions: getActionsForCarrier(carrier),
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCarrierToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (carrierData: Partial<User>) => {
    setIsEditing(true);
    setCarrierToEdit(carrierData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCarrierToEdit(null); // Clear form data on modal close
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [totalItems, currentPage, itemsPerPage]);

  return (
    <div className="carriers-list-wrapper">
      <h2 className="fw-bolder">Carrier List</h2>
      <div className="d-flex align-items-center my-3">
        <button
          className="btn btn-accent d-flex align-items-center ms-auto"
          type="button"
          onClick={openCreateModal}
        >
          <img src={PlusIcon} height={16} width={16} className="me-2" />
          Create
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
            data={carriers}
            onActionClick={handleAction}
          />
          <div className="pagination-container">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      <CreateOrEditCarrier
        isModalOpen={isModalOpen}
        setIsModalOpen={(value: boolean) => {
          setIsModalOpen(value);
          if (!value) fetchCarrierData(); // Refresh carriers after modal close
        }}
        isEditing={isEditing}
        carrierData={carrierToEdit}
        closeModal={closeModal}
      />
    </div>
  );
};

export default CarrierList;
