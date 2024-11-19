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

const CarrierList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [carrierToEdit, setCarrierToEdit] = useState<Partial<User> | null>(
    null
  );
  const [carriers, setCarriers] = useState<User[]>([]);

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
    try {
      const result = await fetchCarriers(UserRole.CARRIER);
      if (result.success) {
        setCarriers(result.data);
      } else {
        toast.error(result.message || "Failed to fetch carrier.");
      }
    } catch (err) {
      toast.error("Error fetching carrier data.");
    }
  }, [fetchCarriers]);

  // Use a single fetch on initial render

  useEffect(() => {
    console.log("Log....");
    fetchCarrierData();
  }, [fetchCarrier]);

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
        toast.error("Failed to delete customer.");
      }
    }
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
        <Table
          columns={columns}
          rows={getRowData()}
          data={carriers}
          actions={["Edit", "Delete"]}
          onActionClick={handleActionClick}
        />
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
