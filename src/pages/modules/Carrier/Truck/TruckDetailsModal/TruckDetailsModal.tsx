import React from "react";

import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { Truck } from "../../../../../types/Truck";
import { User } from "../../../../../types/User";
import { formatDate } from "../../../../../utils/dateFormat";

const TruckDetailsModal: React.FC<{
  isOpen: boolean;
  truckData: Partial<Truck> | null;
  onClose: () => void;
}> = ({ isOpen, truckData, onClose }) => {
  if (!truckData) return null;

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        {
          label: "Origin",
          value: truckData.origin?.str || "N/A",
        },
        {
          label: "Destination",
          value: truckData.destination?.str || "N/A",
        },
        {
          label: "Available Date",
          value: truckData.availableDate
            ? formatDate(truckData.availableDate, "MM/dd/yyyy")
            : "N/A",
        },
        {
          label: "Age",
          value: truckData.formattedAge || "N/A",
        },
        {
          label: "Ref Number",
          value: truckData.referenceNumber || "N/A",
        },
      ],
    },
    {
      heading: "ADDITIONAL DETAILS",
      rows: [
        {
          label: "Equipment",
          value: truckData.equipment || "N/A",
        },
        {
          label: "Weight",
          value: truckData.weight ? `${truckData.weight} lbs` : "N/A",
        },
        {
          label: "Length",
          value: truckData.length ? `${truckData.length} ft` : "N/A",
        },
        {
          label: "Miles",
          value: truckData.miles ? `${truckData.miles} mi` : "N/A",
        },
        {
          label: "All-In Rate",
          value: truckData.allInRate ? `$${truckData.allInRate}` : "N/A",
        },
        {
          label: "Assign User",
          value: (truckData.postedBy as User)?.company || "N/A",
        },
        { label: "Comments", value: truckData.comments || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Truck Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default TruckDetailsModal;
