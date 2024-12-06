import React from "react";
import { User } from "../../../../../types/User";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";

const BrokerDetailsModal: React.FC<{
  isOpen: boolean;
  broker: Partial<User> | null;
  onClose: () => void;
}> = ({ isOpen, broker, onClose }) => {
  if (!broker) return null;

  const formatPhoneNumber = (phoneNumber: string | undefined): string => {
    if (!phoneNumber) return "N/A";

    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const number = phoneUtil.parse(phoneNumber, "US");
      return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
    } catch {
      return phoneNumber;
    }
  };

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        {
          label: "Name",
          value: `${broker.firstName || ""} ${broker.lastName || ""}`,
        },
        { label: "Employee ID", value: broker.employeeId || "N/A" },
        { label: "Email", value: broker.email || "N/A" },
        { label: "Contact", value: formatPhoneNumber(broker.primaryNumber) },
        { label: "Company", value: broker.company || "N/A" },
      ],
    },
    {
      heading: "MAILING ADDRESS",
      rows: [
        { label: "Address", value: broker.address || "N/A", fullWidth: true },
        {
          label: "Address Line 2",
          value: broker.addressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: broker.addressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: broker.city || "N/A" },
        { label: "Zip", value: broker.zip || "N/A" },
        { label: "State", value: broker.state || "N/A" },
        { label: "Country", value: broker.country || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Broker User Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default BrokerDetailsModal;
