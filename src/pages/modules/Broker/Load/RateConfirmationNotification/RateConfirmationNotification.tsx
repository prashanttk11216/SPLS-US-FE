import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../../../components/common/Modal/Modal";
import SelectField from "../../../../../components/common/SelectField/SelectField";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { getUsers } from "../../../../../services/user/userService";
import { UserRole } from "../../../../../enums/UserRole";
import { toast } from "react-toastify";
import { notifyCustomerLoad } from "../../../../../services/load/loadServices";
import TextAreaBox from "../../../../../components/common/TextAreaBox/TextAreaBox";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages";

/**
 * Props for RateConfirmationNotification component
 */
interface RateConfirmationNotificationProps {
  selectedLoad: string;
  closeModal: () => void;
}

/**
 * Form inputs interface
 */
interface FormInputs {
  emailsInput: string;
  customer: string | string[];
}

const EMAIL_REGEX = /^[\w\.-]+@[\w\.-]+\.\w{2,4}$/;
// RateConfirmationNotification Component
export const RateConfirmationNotification: FC<
  RateConfirmationNotificationProps
> = ({ selectedLoad, closeModal }) => {
  const [customersList, setCustomersList] = useState<
    { value: string; label: string; email: string }[]
  >([]);
  const { handleSubmit, control, watch, getValues } = useForm<FormInputs>();

  const { getData, updateData, loading } = useFetchData<any>({
    getAll: {
      user: getUsers,
    },
    update: {
      load: notifyCustomerLoad,
    },
  });

  const emailsInput = watch("emailsInput", "");
  const customerSelected = watch("customer");

  // Fetch customer data from the server
  const fetchCustomersData = useCallback(async () => {
    try {
      const query = `?role=${UserRole.CUSTOMER}&isActive=true`;
      const result = await getData("user", query);
      if (result.success) {
        const users = result?.data?.map((user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
          email: user?.email,
        }));
        setCustomersList(users || []);
      }
    } catch (error) {
      toast.error("An error occurred while fetching customers.");
    }
  }, [getData]);

  // On component mount, fetch customer data
  useEffect(() => {
    fetchCustomersData();
  }, []);

  // Validate and clean emails input
  const processEmailsInput = useCallback((): string[] => {
    const inputEmails = getValues("emailsInput")
      ?.split(/[\s,;]+/)
      .map((email) => email.trim())
      .filter((email) => EMAIL_REGEX.test(email));
    return inputEmails || [];
  }, [getValues]);

  // Form submission handler
  const onSubmit = async () => {
    let emails: string[] = [];
    const inputEmails = processEmailsInput();

    // Handle if customerSelected is either single or multiple
    if (Array.isArray(customerSelected)) {
      emails = customersList
        .filter((customer) =>
          customerSelected.some((selected) => selected === customer.value)
        )
        .map((customer) => customer.email);
    } else if (customerSelected) {
      emails = customersList
        .filter((customer) => customer.value === customerSelected)
        .map((customer) => customer.email);
    }

    // Merge emails from selected customers and input emails
    if (inputEmails.length > 0) emails.push(...inputEmails);

    if (emails.length === 0) {
      toast.error("No valid email addresses to notify.");
      return;
    }

    try {
      const response = await updateData("load", selectedLoad, { emails });
      if (response.success) {
        toast.success(response.message || "Notification sent successfully.");
        closeModal();
      }
    } catch (error) {
      toast.error("An error occurred while sending notifications.");
    }
  };

  // Memoized boolean to check if all emails are valid
  const allEmailsValid = useMemo(() => {
    return emailsInput
      ?.split(/[\s,;]+/)
      .filter((email) => email.trim() !== "")
      .every((email) => EMAIL_REGEX.test(email.trim()));
  }, [emailsInput]);

  const validateEmails = (value: any) => {
    if(!value) return true;
    const emails =
      value?.split(/[\s,;]+/).filter((email: any) => email.trim() !== "") || [];
    return (
      emails.every((email: any) => EMAIL_REGEX.test(email.trim())) ||
      "One or more emails are invalid."
    );
  };

  return (
    <Modal
      isOpen={!!selectedLoad}
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
            disabled={!!customerSelected}
            rules={{
              required: VALIDATION_MESSAGES.defaultRequired,
              validate: validateEmails,
            }}
          />
        </div>

        <div className="text-center fw-bold">or</div>

        {/* Customer Dropdown */}
        <div>
          <SelectField
            label="Select Customer"
            name="customer"
            placeholder="Select controled Customer"
            control={control}
            options={customersList}
            isClearable={true}
            disabled={!!emailsInput?.trim()}
            rules={{
              required: {
                value: true,
                message: VALIDATION_MESSAGES.defaultRequired,
              },
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="text-end mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              (!emailsInput?.trim() && !customerSelected) ||
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
