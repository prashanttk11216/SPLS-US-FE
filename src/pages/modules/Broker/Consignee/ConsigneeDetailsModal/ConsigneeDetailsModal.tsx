import React from "react";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import { Consignee } from "../../../../../types/Consignee";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";

const ConsigneeDetailsModal: React.FC<{
  isOpen: boolean;
  consignee: Partial<Consignee> | null;
  onClose: () => void;
}> = ({ isOpen, consignee, onClose }) => {
  if (!consignee) return null;

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
          value: `${consignee.firstName || ""} ${consignee.lastName || ""}`,
        },
        { label: "Email", value: consignee.email || "N/A" },
        { label: "Contact", value: formatPhoneNumber(consignee.primaryNumber) },
        { label: "Shipping Hours", value: consignee.shippingHours || "N/A" },
      ],
    },
    {
      heading: "ADDRESS",
      rows: [
        {
          label: "Address",
          value: consignee.address || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 2",
          value: consignee.addressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: consignee.addressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: consignee.city || "N/A" },
        { label: "Zip", value: consignee.zip || "N/A" },
        { label: "State", value: consignee.state || "N/A" },
        { label: "Country", value: consignee.country || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Consignee Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default ConsigneeDetailsModal;
