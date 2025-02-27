import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { useCallback, useEffect, useState } from "react";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Pagination, { PaginationState } from "../../../../../components/common/Pagination/Pagination";
import { toast } from "react-toastify";
import PlusIcon from '../../../../../assets/icons/plus.svg';
import SearchBar from "../../../../../components/common/SearchBar/SearchBar";
import Loading from "../../../../../components/common/Loading/Loading";
import Table from "../../../../../components/common/Table/Table";
import { deleteQuote, getQuoteById, getQuotes } from "../../../../../services/quote/quoteServices";
import { IQuote } from "../../../../../types/Quote";
import CreateOrEditQuote from "../CreateOrEditQuote/CreateOrEditQuote";
import usePagination from "../../../../../hooks/usePagination";

const QuoteList: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [quoteId, setQuoteId] = useState<string>();
    const [quotes, setQuotes] = useState<IQuote[]>([]);
    const { meta, updatePagination } = usePagination(); // Pagination metadata
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchField, setSearchField] = useState<string>("name");
  
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: "asc" | "desc";
    } | null>(null);
  
    const { getData, deleteData, loading } = useFetchData<any>({
      getAll: {
        quote: getQuotes,
      },
      getById: {
        quote: getQuoteById
      },
      remove: {
        quote: deleteQuote,
      }
    });
  
    const fetchQuotesData = useCallback(
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
  
          const result = await getData("quote", query);
          if (result.success) {
            const quoteData = result.data as IQuote[];
  
            setQuotes(quoteData);
            updatePagination(result.meta as PaginationState);
          } else {
            toast.error(result.message || "Failed to fetch Quotes.");
          }
        } catch (err) {
          toast.error("Error fetching Quotes data.");
        }
      },
      [getData, searchQuery, user, sortConfig]
    );
  
    useEffect(() => {
      if (user && user._id) {
        fetchQuotesData();
      }
    }, [user, searchQuery, sortConfig]);
  
    const openCreateModal = () => {
      setIsEditing(false);
      setQuoteId("");
      setIsModalOpen(true);
    };
  
    const openEditModal = (_id: string) => {
      setIsEditing(true);
      setQuoteId(_id);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setQuoteId("");
    };

  
    const handleAction = async (action: string, row: Record<string, any>) => {
      switch (action) {
        case "Edit":
          openEditModal(row._id);
          break;
        case "Delete":
          try {
            const result = await deleteData("quote", row._id);
            if (result.success) {
              toast.success(result.message);
              fetchQuotesData();
            }
          } catch {
            toast.error("Failed to delete Quote.");
          }
          break;
        default:
          toast.info(`Action "${action}" is not yet implemented.`);
      }
    };
  
    const handleSort = (
      sortStr: { key: string; direction: "asc" | "desc" } | null
    ) => {
      setSortConfig(sortStr); // Updates the sort query to trigger API call
    };
  
    const getActions = (): string[] => {
      const actions = ["Edit", "Delete"];
      return actions;
    };
  
    const columns = [
      { width: "250px", key: "name", label: "Name" },
      { width: "90px", key: "isActive", label: "Status", sortable: true },
      { width: "90px", key: "actions", label: "Actions", isAction: true },
    ];
  
    const handlePageChange = (page: number) => {
      fetchQuotesData(page);
    };
  
    const handleItemsPerPageChange = (limit: number) => {
      fetchQuotesData(1, limit);
    };
  
    const getRowData = () => {
      return quotes.map((quote) => ({
        _id: quote._id,
        name: quote.name,
        isActive: quote.isActive ? "Active" : "Inactive",
        actions: getActions(),
      }));
    };
  
    const handleSearch = (query: string) => {
      setSearchQuery(query);
    };
  
    return (
      <div className="quotes-list-wrapper">
        <div className="d-flex align-items-center">
          <h2 className="fw-bolder">Quotes Status</h2>
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
              data={quotes}
              onActionClick={handleAction}
              rowClickable={true}
              onSort={handleSort}
              sortConfig={sortConfig}
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
          <CreateOrEditQuote
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            setIsModalOpen={(value: boolean) => {
              setIsModalOpen(value);
              if (!value) fetchQuotesData();
            }}
            isEditing={isEditing}
            quoteId={quoteId}
          />
        )}
      </div>
    );
  };
  
  export default QuoteList;