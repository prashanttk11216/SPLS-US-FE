import React from "react";
import { Shipper } from "../../../../../types/Shipper";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { formatPhoneNumber } from "../../../../../utils/phoneUtils";

const ShipperDetailsModal: React.FC<{
  isOpen: boolean;
  shipper: Partial<Shipper> | null;
  onClose: () => void;
}> = ({ isOpen, shipper, onClose }) => {
  if (!shipper) return null;

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        {
          label: "Name",
          value: `${shipper.firstName || ""} ${shipper.lastName || ""}`,
        },
        { label: "Email", value: shipper.email || "N/A" },
        { label: "Contact", value: formatPhoneNumber(shipper.primaryNumber) },
        { label: "Shipping Hours", value: shipper.shippingHours || "N/A" },
      ],
    },
    {
      heading: "MAILING ADDRESS",
      rows: [
        { label: "Address", value: shipper.address?.str || "N/A", fullWidth: true },
        {
          label: "Address Line 2",
          value: shipper.addressLine2 || "N/A",
          fullWidth: true,
        },
        {
          label: "Address Line 3",
          value: shipper.addressLine3 || "N/A",
          fullWidth: true,
        },
        { label: "City", value: shipper.city || "N/A" },
        { label: "Zip", value: shipper.zip || "N/A" },
        { label: "State", value: shipper.state || "N/A" },
        { label: "Country", value: shipper.country || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Shipper Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default ShipperDetailsModal;
