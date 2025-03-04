import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../../../components/common/Modal/Modal";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { getUsers } from "../../../../../services/user/userService";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import { notifyCarrierAboutLoad } from "../../../../../services/load/loadServices";
import CheckboxField from "../../../../../components/common/CheckboxField/CheckboxField";
import TextAreaBox from "../../../../../components/common/TextAreaBox/TextAreaBox";

/**
 * Props for LoadCreationAlert component
 */
interface LoadCreationAlertProps {
  selectedLoads: string[];
  closeModal: () => void;
}

/**
 * Form inputs interface
 */
interface FormInputs {
  emailsInput: string;
  carrier: string | string[];
  notifyAll: boolean; // Checkbox state
}

const EMAIL_REGEX = /^[\w\.-]+@[\w\.-]+\.\w{2,4}$/;

export const LoadCreationAlert: FC<LoadCreationAlertProps> = ({
  selectedLoads,
  closeModal,
}) => {
  const [carrierList, setCarriersList] = useState<
    { value: string; label: string; email: string }[]
  >([]);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
  } = useForm<FormInputs>(); 

  const {
    getData,       // Fetch all data for any entity
    createData,    // Create new item
    loading,
  } = useFetchData<any>({
    getAll: {
      user: getUsers,
    },
    create: {
      load: notifyCarrierAboutLoad,
    },
  });

  const emailsInput = watch("emailsInput", "");
  const carrierSelected = watch("carrier");
  const notifyAll = watch("notifyAll", false); // Watch checkbox state

  /**
   * Fetch carrier data from the server
   */
  const fetchCarriersData = useCallback(async () => {
    try {
      const query = `?role=${UserRole.CARRIER}&isActive=true`;
      const result = await getData("user", query);
      if (result.success) {
        const users = result?.data?.map((user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
          email: user?.email,
        }));
        setCarriersList(users || []);
      } else {
        toast.error("Failed to fetch carriers.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching carriers.");
    }
  }, [getData]);

  useEffect(() => {
    fetchCarriersData();
  }, []);

  /**
   * Validate and clean emails input
   */
  const processEmailsInput = useCallback((): string[] => {
    const inputEmails = getValues("emailsInput")
      ?.split(/[\s,;]+/)
      .map((email) => email.trim())
      .filter((email) => EMAIL_REGEX.test(email));
    return inputEmails || [];
  }, [getValues]);

  /**
   * Form submission handler
   */
  const onSubmit = async () => {
    const emails: string[] = [];
    const inputEmails = processEmailsInput();

    // Handle selected carriers
    if (!notifyAll && carrierSelected) {
      if (Array.isArray(carrierSelected)) {
        emails.push(
          ...carrierList
            .filter((carrier) =>
              carrierSelected.some((selected) => selected === carrier.value)
            )
            .map((carrier) => carrier.email)
        );
      } else {
        emails.push(
          ...carrierList
            .filter((carrier) => carrier.value === carrierSelected)
            .map((carrier) => carrier.email)
        );
      }
    }

    // Merge emails from selected carriers and input emails
    if (inputEmails.length > 0) emails.push(...inputEmails);

    if (!notifyAll && emails.length === 0) {
      toast.error("No valid email addresses to notify.");
      return;
    }

    try {
      const response = await createData("load",{
        emails,
        loadIds: selectedLoads,
        internalCarrier: notifyAll,
      });
      if (response.success) {
        toast.success(response.message || "Notification sent successfully.");
        closeModal();
      } else {
        toast.error(response.message || "Failed to send notification.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while sending notifications.");
    }
  };

  const allEmailsValid = useMemo(() => {
    return emailsInput
      ?.split(/[\s,;]+/)
      .filter((email) => email.trim() !== "")
      .every((email) => EMAIL_REGEX.test(email.trim()));
  }, [emailsInput]);

  const validateEmails = (value: any) => {
    const emails =
      value?.split(/[\s,;]+/).filter((email: any) => email.trim() !== "") || [];
    return (
      emails.every((email: any) => EMAIL_REGEX.test(email.trim())) ||
      "One or more emails are invalid."
    );
  };

  return (
    <Modal
      isOpen={!!selectedLoads}
      onClose={closeModal}
      title="Notification Email"
      size="lg"
      isCentered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Textarea Input */}
        <div className="mb-3">
          <TextAreaBox
            label="Enter email addresses"
            id="emailsInput"
            name="emailsInput"
            placeholder="Enter emails separated by commas, spaces, or semicolons."
            control={control}
            rows={3}
            rules={{
              validate: validateEmails,
            }}
          />
        </div>

        {/* Carrier Dropdown */}
        <div>
          <SelectField
            label="Select Carrier"
            name="carrier"
            placeholder="Select Registered Carrier"
            control={control}
            options={carrierList}
            isClearable={true}
            isDisabled={notifyAll}
          />
        </div>

        <div className="text-center fw-bold my-3">or</div>

        {/* Checkbox for Notify All Internal Carriers */}
        <div>
          <CheckboxField
            label="Notify all internal carriers"
            id="notifyAll"
            name="notifyAll"
            control={control}
            disabled={!!carrierSelected}
          />
        </div>

        {/* Submit Button */}
        <div className="text-end mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              (!emailsInput?.trim() && !carrierSelected && !notifyAll) ||
              (!!emailsInput?.trim() && !allEmailsValid)
            }
          >
            {"Send Notification"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
