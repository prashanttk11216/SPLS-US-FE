import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { useCallback, useEffect, useState } from "react";
import { IRole } from "../../../../../schema/Role";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { deleteRole, getRoleById, getRoles } from "../../../../../services/role/roleServices";
import Pagination, { PaginationState } from "../../../../../components/common/Pagination/Pagination";
import { toast } from "react-toastify";
import PlusIcon from '../../../../../assets/icons/plus.svg';
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import Loading from "../../../../../components/common/Loading/Loading";
import Table from "../../../../../components/common/Table/Table";
import CreateOrEditRole from "../CreateOrEditRole/CreateOrEditRole";
import usePagination from "../../../../../hooks/usePagination";

const RoleList: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [roleId, setRoleId] = useState<string>();
    const [roles, setRoles] = useState<IRole[]>([]);
    const { meta, updatePagination } = usePagination(); // Pagination metadata

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchField, setSearchField] = useState<string>("name");
  
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: "asc" | "desc";
    } | null>(null);
  
    // View Details Option Added
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
    const [shipperDetails, setRoleDetails] = useState<Partial<IRole> | null>(
      null
    );
  
    const { getData, getDataById, deleteData, loading } = useFetchData<any>({
      getAll: {
        role: getRoles,
      },
      getById: {
        role: getRoleById
      },
      remove: {
        role: deleteRole,
      }
    });
  
    const fetchRolesData = useCallback(
      async (page: number = 1, limit: number = 10) => {
        if (!user || !user._id) return;
        try {
          let query = `?page=${page}&limit=${limit}`;
  
          //Search Functionality
          if (searchQuery && searchField) {
            query += `&search=${encodeURIComponent(
              searchQuery
            )}&searchField=${searchField}`;
          }
  
          if (sortConfig) {
            query += `&sort=${sortConfig.key}:${sortConfig.direction}`;
          }
  
          const result = await getData("role", query);
          if (result.success) {
            const roleData = result.data as IRole[];
  
            setRoles(roleData);
            updatePagination(result.meta as PaginationState);
          } else {
            toast.error(result.message || "Failed to fetch Roles.");
          }
        } catch (err) {
          toast.error("Error fetching Roles data.");
        }
      },
      [getData, searchQuery, user, sortConfig]
    );
  
    useEffect(() => {
      if (user && user._id) {
        fetchRolesData();
      }
    }, [user, searchQuery, sortConfig]);
  
    const openCreateModal = () => {
      setIsEditing(false);
      setRoleId("");
      setIsModalOpen(true);
    };
  
    const openEditModal = (_id: string) => {
      setIsEditing(true);
      setRoleId(_id);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setRoleId("");
    };
  
    // View Details Option Added
    const openDetailsModal = (roleData: Partial<IRole>) => {
      setRoleDetails(roleData);
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
            const result = await deleteData("role", row._id);
            if (result.success) {
              toast.success(result.message);
              fetchRolesData();
            }
          } catch {
            toast.error("Failed to delete Role.");
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
  
    const getActions = (role: IRole): string[] => {
      const actions = ["View Details", "Edit", "Delete"];
      return actions;
    };
  
    const columns = [
      { width: "250px", key: "name", label: "Name" },
      { width: "90px", key: "actions", label: "Actions", isAction: true },
    ];
  
    const handlePageChange = (page: number) => {
      fetchRolesData(page);
    };
  
    const handleItemsPerPageChange = (limit: number) => {
      fetchRolesData(1, limit);
    };
  
    const getRowData = () => {
      return roles.map((role) => ({
        _id: role._id,
        name: role.name,
        actions: getActions(role),
      }));
    };
  
    const handleSearch = (query: string) => {
      setSearchQuery(query);
    };
  
    return (
      <div className="roles-list-wrapper">
        <div className="d-flex align-items-center">
          <h2 className="fw-bolder">Roles</h2>
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
                { label: "Name", value: "name" },
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
              data={roles}
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
  
        {isModalOpen && (
          <CreateOrEditRole
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            setIsModalOpen={(value: boolean) => {
              setIsModalOpen(value);
              if (!value) fetchRolesData();
            }}
            isEditing={isEditing}
            roleId={roleId}
          />
        )}
  
        {/* {isDetailsModalOpen && (
          <ShipperDetailsModal
            isOpen={isDetailsModalOpen}
            shipper={shipperDetails}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        )} */}
      </div>
    );
  };
  
  export default RoleList;