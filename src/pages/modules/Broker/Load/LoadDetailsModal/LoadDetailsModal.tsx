import React from "react";
import { Load } from "../../../../../types/Load";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";

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
        { label: "Name", value: load.origin || "N/A", fullWidth: true },
        {
          label: "Early Pick-Up Date",
          value: String(load.originEarlyPickupDate || "N/A"),
          fullWidth: true,
        },
        {
          label: "Early Pick-Up Time",
          value: String(load.originEarlyPickupTime || "N/A"),
          fullWidth: true,
        },
        {
          label: "Late Pick-Up Date",
          value: String(load.originLatePickupDate || "N/A"),
          fullWidth: true,
        },
        {
          label: "Late Pick-Up Time",
          value: String(load.originLatePickupTime || "N/A"),
          fullWidth: true,
        },
      ],
    },
    {
      heading: "DESTINATION",
      rows: [
        {
          label: "Destination",
          value: load.destination || "N/A",
          fullWidth: true,
        },
        {
          label: "Early Drop-off Date",
          value: String(load.destinationEarlyDropoffDate || "N/A"),
          fullWidth: true,
        },
        {
          label: "Early Drop-off Time",
          value: String(load.destinationEarlyDropoffTime || "N/A"),
          fullWidth: true,
        },
        {
          label: "Late Drop-off Date",
          value: String(load.destinationLateDropoffDate || "N/A"),
          fullWidth: true,
        },
        {
          label: "Late Drop-off Time",
          value: String(load.destinationLateDropoffTime || "N/A"),
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
        { label: "All-in Rate", value: load.customerRate || "N/A" },
        { label: "Weight", value: load.weight || "N/A" },
        { label: "Length", value: load.length || "N/A" },
        { label: "Width", value: load.width || "N/A" },
        { label: "Height", value: load.height || "N/A" },
        { label: "Distance", value: load.distance || "N/A" },
        { label: "Pieces", value: load.pieces || "N/A" },
        { label: "Pallets", value: load.pallets || "N/A" },
        { label: "Load Option", value: load.loadOption || "N/A" },
        { label: "Commodity", value: load.commodity || "N/A" },
        { label: "Load Number", value: load.loadNumber || "N/A" },
        { label: "Assign User", value: load.postedBy || "N/A" },
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
