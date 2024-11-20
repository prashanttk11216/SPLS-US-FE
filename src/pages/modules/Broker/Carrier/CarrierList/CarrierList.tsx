import React, { useCallback, useEffect, useState } from "react";
import PlusIcon from "../../../../../assets/icons/plus.svg";
import Loading from "../../../../../components/common/Loading/Loading";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import {
  deleteUser,
  getUserById,
  getUsers,
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
  const [carrierToEdit, setCarrierToEdit] = useState<Partial<User> | null>(
    null
  );
  const [carriers, setCarriers] = useState<User[]>([]);

  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const storedItemsPerPage = localStorage.getItem("itemsPerPage");
    return storedItemsPerPage ? Number(storedItemsPerPage) : 10;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

  // const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const {
    fetchData: fetchCarriers,
    fetchDataById: fetchCarrier,
    deleteDataById: deleteCarrier,
    loading,
    error,
  } = useFetchData<any>({
    fetchDataService: getUsers,
    fetchByIdService: getUserById,
    deleteDataService: deleteUser,
  });

  //fetch Carrier data

  const fetchCarrierData = useCallback(async () => {
    if (!user || !user._id) return; // Wait for user data
    try {
      let query = `?role=${UserRole.CARRIER}&page=${currentPage}&limit=${itemsPerPage}`;
      if (user.role === UserRole.BROKER_USER) {
        query += `&brokerId=${user._id}`;
      }

      console.log("Query:", query);
      const result = await fetchCarriers(query);
      if (result.success) {
        setCarriers(result.data);
      } else {
        toast.error(result.message || "Failed to fetch carrier.");
      }
    } catch (err) {
      toast.error("Error fetching carrier data.");
    }
  }, [fetchCarriers, user, currentPage, itemsPerPage]);

  // Use a single fetch on initial render

  useEffect(() => {
    if (user && user._id) {
      fetchCarrierData();
    }
  }, [fetchCarrier, user]);

  const columns = [
    { key: "name", label: "Name", width: "40%" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const handleActionClick = async (
    action: string,
    row: Record<string, any>
  ) => {
    if (action === "Edit") {
      try {
        const carrierData = await fetchCarrier(row._id);
        openEditModal(carrierData.data);
      } catch (err) {
        toast.error("Failed to fetch customer details for editing.");
      }
    }
    if (action === "Delete") {
      try {
        const result = await deleteCarrier(row._id);
        if (result.success) {
          toast.success(result.message);
          fetchCarrierData();
        }
      } catch (err) {
        toast.error("Failed to delete carrier.");
      }
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    // console.log("Selected itemsPerPage:", newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", newItemsPerPage.toString()); // Reset to the first page when items per page changes
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    console.log(`Fetching items from ${startIndex} to ${endIndex}`);
    return carriers.slice(startIndex, endIndex);
  };

  const getRowData = () => {
    return getPaginatedData().map((carrier) => ({
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
      contact: carrier.contactNumber || "N/A",
      company: carrier.company || "N/A",
      status: carrier.isActive ? "Active" : "Inactive",
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
  // Adjust current page if data changes
  useEffect(() => {
    const totalPages = Math.ceil(carriers.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1)); // Ensure valid page
    }
  }, [carriers, currentPage, itemsPerPage]);

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
        // <Table
        //   columns={columns}
        //   rows={getRowData()}
        //   data={customers}
        //   actions={["Edit", "Delete"]}
        //   onActionClick={handleActionClick}
        // />

        <>
          <Table
            columns={columns}
            rows={getRowData()}
            data={carriers}
            actions={["Edit", "Delete"]}
            onActionClick={handleActionClick}
          />
          <div className="pagination-container">
            <Pagination
              totalItems={carriers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
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
