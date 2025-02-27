import { FC, useEffect } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import {
  createQuote,
  editQuote,
  getQuoteById,
} from "../../../../../services/quote/quoteServices";
import RadioGroupField from "../../../../../components/common/RadioGroupField/RadioGroupField";
import { IQuote } from "../../../../../types/Quote";
import {
  createQuoteSchema,
  updateQuoteSchema,
} from "../../../../../schema/Quote";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";

interface CreateOrEditQuoteProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing quote
  quoteId?: string; // Pre-filled data for editing
  closeModal: () => void;
}

const CreateOrEditQuote: FC<CreateOrEditQuoteProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  quoteId,
  closeModal,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<IQuote>({
    mode: "onBlur",
    defaultValues: {
        isActive: true, // Ensure it's null before loading real data
    },
  });

  const { createData, getDataById, updateData, loading, error } =
    useFetchData<any>({
      create: {
        quote: createQuote,
      },
      getById: {
        quote: getQuoteById,
      },
      update: {
        quote: editQuote,
      },
    });

  /**
   * Handles form submission for creating or editing a quoteUser.
   * @param data - Form data
   */
  const submit = async (data: IQuote) => {
    try {
      let result;
      if (isEditing && quoteId) {
        // Update quote if editing
        const validatedData = updateQuoteSchema.parse(data);
        result = await updateData("quote", quoteId, validatedData);
      } else {
        const validatedData = createQuoteSchema.parse(data);
        if(typeof user.brokerId === "string") validatedData.brokerId = user.brokerId;
        validatedData.postedBy = user._id;
        result = await createData("quote", validatedData);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Quote updated successfully."
            : "Quote created successfully."
        );
        setIsModalOpen(false);
      } else {
        throw new Error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const reFillData = async () => {
    const quoteData = await getDataById("quote", quoteId!);
    if (quoteData.success) reset(quoteData.data);
  };

  // Reset form state or pre-fill values when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      if (isEditing && quoteId) {
        reFillData();
      } else {
        // Clear form when creating
        reset({
          name: "",
          isActive: true,
        });
      }
    }
  }, [isModalOpen, reset, isEditing, quoteId]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        closeModal();
      }}
      title={isEditing ? "Edit Quote" : "Create Quote"}
      size="lg"
      isCentered
    >
      {/* Show loader during API calls */}
      {loading && <Loading />}

      {/* Display error message if API fails */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error: </strong>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(submit)}>
        <div className="row">
          {/* Name */}
          <div className="col-12">
            <Input
              label="Quote Name"
              type="text"
              id="name"
              name="name"
              placeholder="Enter Quote Name"
              control={control}
              rules={{ required: VALIDATION_MESSAGES.quoteNameRequired }}
            />
          </div>

          <div className="col-12">
            <RadioGroupField
              label="Select Status"
              name="isActive"
              options={[
                { label: "Active", value: true},
                { label: "Inactive", value: false},
              ]}
              control={control}
              layout="vertical"
              rules={{
                validate: (value: boolean) => value !== undefined && value !== null || "Please select a status",
              }}         
              />
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-end">
            <button
              className="btn btn-accent"
              type="submit"
              disabled={!isValid || loading}
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrEditQuote;
