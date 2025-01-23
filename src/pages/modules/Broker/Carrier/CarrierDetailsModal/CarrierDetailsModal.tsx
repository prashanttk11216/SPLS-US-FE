import React from "react";
import { User } from "../../../../../types/User";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";

const CarrierDetailsModal: React.FC<{
  isOpen: boolean;
  carrier: Partial<User> | null;
  onClose: () => void;
}> = ({ isOpen, carrier, onClose }) => {
  if (!carrier) return null;

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        {
          label: "Name",
          value: `${carrier.firstName || ""} ${carrier.lastName || ""}`,
        },
        { label: "Email", value: carrier.email || "N/A" },
        { label: "Contact", value: formatPhoneNumber(carrier.primaryNumber) },
        { label: "Company", value: carrier.company || "N/A" },
      ],
    },
    {
      heading: "MAILING ADDRESS",
      rows: [
        { label: "Address", value: carrier.address?.str || "N/A", fullWidth: true },
        {
          label: "Address Line 2",
          value: carrier.addressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: carrier.addressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: carrier.city || "N/A" },
        { label: "Zip", value: carrier.zip || "N/A" },
        { label: "State", value: carrier.state || "N/A" },
        { label: "Country", value: carrier.country || "N/A" },
      ],
    },
    {
      heading: "BILLING ADDRESS",
      rows: [
        {
          label: "Address",
          value: carrier.billingAddress?.str || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 2",
          value: carrier.billingAddressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: carrier.billingAddressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: carrier.billingCity || "N/A" },
        { label: "Zip", value: carrier.billingZip || "N/A" },
        { label: "State", value: carrier.billingState || "N/A" },
        { label: "Country", value: carrier.billingCountry || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Carrier Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default CarrierDetailsModal;
