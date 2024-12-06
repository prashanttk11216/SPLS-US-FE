import React from "react";
import { User } from "../../../../../types/User";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";

const CarrierDetailsModal: React.FC<{
  isOpen: boolean;
  carrier: Partial<User> | null;
  onClose: () => void;
}> = ({ isOpen, carrier, onClose }) => {
  if (!carrier) return null;

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
        { label: "Address", value: carrier.address || "N/A", fullWidth: true },
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
