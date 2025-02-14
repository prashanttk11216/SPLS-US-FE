import { FC, useEffect } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";
import Input from "../../../../../components/common/Input/Input";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import Loading from "../../../../../components/common/Loading/Loading";
import { IRole } from "../../../../../schema/Role";
import {
  createRole,
  editRole,
  getRoleById,
} from "../../../../../services/role/roleServices";
import SelectField from "../../../../../components/common/SelectField/SelectField";

interface CreateOrEditRoleProps {
  isModalOpen: boolean; // Controls modal visibility
  setIsModalOpen: (value: boolean) => void; // Setter for modal visibility
  isEditing: boolean; // Indicates if editing an existing role
  roleId?: string; // Pre-filled data for editing
  closeModal: () => void;
}

const actionOptions = [
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "view", label: "View" },
  { value: "delete", label: "Delete" },
];

const CreateOrEditRole: FC<CreateOrEditRoleProps> = ({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  roleId,
  closeModal,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<IRole>({
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "permissions",
  });

  const { createData, getDataById, updateData, loading, error } =
    useFetchData<any>({
      create: {
        role: createRole,
      },
      getById: {
        role: getRoleById,
      },
      update: {
        role: editRole,
      },
    });

  /**
   * Handles form submission for creating or editing a roleUser.
   * @param data - Form data
   */
  const submit = async (data: IRole) => {
    try {
      let result;
      if (isEditing && roleId) {
        // Update role if editing
        result = await updateData("role", roleId, data);
      } else {
        result = await createData("role", data);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Role updated successfully."
            : "Role created successfully."
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
    const roleData = await getDataById("role", roleId!);
    if (roleData.success) reset(roleData.data);
  };

  // Reset form state or pre-fill values when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      if (isEditing && roleId) {
        reFillData();
      } else {
        // Clear form when creating
        reset({
          name: "",
          permissions: [],
        });
      }
    }
  }, [isModalOpen, reset, isEditing, roleId]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        closeModal();
      }}
      title={isEditing ? "Edit Role" : "Create Role"}
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
          {/* Role Name */}
          <div className="col-12">
            <Input
              label="Role Name"
              type="text"
              id="name"
              name="name"
              placeholder="Enter Role Name"
              control={control}
              rules={{ required: VALIDATION_MESSAGES.roleNameRequired }}
            />
          </div>
        </div>

        {/* Permissions */}
        {fields.map((item, index) => (
          <div className="row py-2 border-top border-bottom border-secondary border-2" key={item.id}>
            <div className="col-12 text-end">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
            <div className="col-12">
              <Input
                label="Resource"
                type="text"
                id={`resource-${index}`}
                name={`permissions[${index}].resource`}
                placeholder="Enter Resource"
                control={control}
                rules={{ required: VALIDATION_MESSAGES.resourceRequired }}
              />
            </div>
            <div className="col-12">
              <SelectField
                label="Actions"
                name={`permissions[${index}].actions`}
                placeholder="Select Actions"
                control={control}
                options={actionOptions}
                isMulti
                rules={{
                  required: {
                    value: true,
                    message: VALIDATION_MESSAGES.actionsRequired,
                  },
                }}
              />
            </div>
          </div>
        ))}

        <div className="row mt-2">
          <div className="col-12 text-center">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => append({ resource: "", actions: ["create"] })}
            >
              Add Permission
            </button>
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

export default CreateOrEditRole;
