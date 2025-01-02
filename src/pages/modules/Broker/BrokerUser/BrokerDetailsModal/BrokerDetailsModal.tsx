import React from "react";
import { User } from "../../../../../types/User";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";

const BrokerDetailsModal: React.FC<{
  isOpen: boolean;
  broker: Partial<User> | null;
  onClose: () => void;
}> = ({ isOpen, broker, onClose }) => {
  if (!broker) return null;

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
        { label: "Address", value: broker.address?.str || "N/A", fullWidth: true },
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
