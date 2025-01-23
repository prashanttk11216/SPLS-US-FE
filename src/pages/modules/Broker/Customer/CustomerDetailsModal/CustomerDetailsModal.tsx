import React from "react";
import { User } from "../../../../../types/User";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";

const CustomerDetailsModal: React.FC<{
  isOpen: boolean;
  customer: Partial<User> | null;
  onClose: () => void;
}> = ({ isOpen, customer, onClose }) => {
  if (!customer) return null;

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        {
          label: "Name",
          value: `${customer.firstName || ""} ${customer.lastName || ""}`,
        },
        { label: "Email", value: customer.email || "N/A" },
        { label: "Contact", value: formatPhoneNumber(customer.primaryNumber) },
        { label: "Company", value: customer.company || "N/A" },
      ],
    },
    {
      heading: "MAILING ADDRESS",
      rows: [
        { label: "Address", value: customer.address?.str || "N/A", fullWidth: true },
        {
          label: "Address Line 2",
          value: customer.addressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: customer.addressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: customer.city || "N/A" },
        { label: "Zip", value: customer.zip || "N/A" },
        { label: "State", value: customer.state || "N/A" },
        { label: "Country", value: customer.country || "N/A" },
      ],
    },
    {
      heading: "BILLING ADDRESS",
      rows: [
        {
          label: "Address",
          value: customer.billingAddress?.str || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 2",
          value: customer.billingAddressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: customer.billingAddressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: customer.billingCity || "N/A" },
        { label: "Zip", value: customer.billingZip || "N/A" },
        { label: "State", value: customer.billingState || "N/A" },
        { label: "Country", value: customer.billingCountry || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Customer Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default CustomerDetailsModal;
