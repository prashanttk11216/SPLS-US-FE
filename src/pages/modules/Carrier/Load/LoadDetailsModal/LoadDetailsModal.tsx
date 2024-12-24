import React from "react";
import { Load } from "../../../../../types/Load";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { User } from "../../../../../types/User";
import { formatDate } from "../../../../../utils/dateFormat";

const LoadDetailsModal: React.FC<{
  isOpen: boolean;
  load: Partial<Load> | null;
  onClose: () => void;
}> = ({ isOpen, load, onClose }) => {
  if (!load) return null;

  const details = [
    {
      heading: "ORIGIN",
      rows: [
        { label: "Name", value: load.origin?.str || "N/A", fullWidth: true },
        {
          label: "Pick-Up",
          value: load.originEarlyPickupDate
            ? formatDate(load.originEarlyPickupDate, 'MM/dd/yyyy') 
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Pick-Up Time",
          value: load.originEarlyPickupTime
            ? formatDate(load.originEarlyPickupTime, 'h:mm aa')  
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Miles",
          value: String(load.miles || "N/A"),
          fullWidth: true,
        },
      ],
    },
    {
      heading: "DESTINATION",
      rows: [
        {
          label: "Destination",
          value: load.destination?.str || "N/A",
          fullWidth: true,
        },
        {
          label: "Early Drop-off Date",
          value: load.destinationEarlyDropoffDate
            ? formatDate(load.destinationEarlyDropoffDate, 'MM/dd/yyyy') 
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Early Drop-off Time",
          value: load.destinationEarlyDropoffTime
            ? formatDate(load.destinationEarlyDropoffTime, 'h:mm aa')
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Late Drop-off Date",
          value: load.destinationLateDropoffDate
            ? formatDate(load.destinationLateDropoffDate, 'MM/dd/yyyy') 
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Late Drop-off Time",
          value: load.destinationLateDropoffTime
            ? formatDate(load.destinationLateDropoffTime, 'h:mm aa')  
            : "N/A",
          fullWidth: true,
        },
      ],
    },
    {
      heading: "MORE DETAILS",
      rows: [
        { label: "Equipment", value: load.equipment || "N/A" },
        { label: "Mode", value: load.mode || "N/A" },
        { label: "Broker Rate", value: load.allInRate || "N/A" },
        { label: "Weight", value: (load.weight && (load.weight + "lbs")) || "N/A" },
        { label: "Length", value: (load.length && (load.length + "ft")) || "N/A" },
        { label: "Width", value: load.width || "N/A" },
        { label: "Height", value: load.height || "N/A" },
        { label: "Distance(Miles)", value: load.miles || "N/A" },
        { label: "Pieces", value: load.pieces || "N/A" },
        { label: "Pallets", value: load.pallets || "N/A" },
        { label: "Load Option", value: load.loadOption || "N/A" },
        { label: "Commodity", value: load.commodity || "N/A" },
        { label: "Load Number", value: load.loadNumber || "N/A" },
        { label: "Assign User", value: (load.postedBy as User)?.company || "N/A" },
        { label: "Special Info", value: load.specialInstructions || "N/A" },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Load Details"
      onClose={onClose}
      details={details}
    />
  );
};

export default LoadDetailsModal;
