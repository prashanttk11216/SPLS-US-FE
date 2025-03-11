import React from "react";
import { Load } from "../../../../../types/Load";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { User } from "../../../../../types/User";
import { formatDate } from "../../../../../utils/dateFormat";
import { formatNumber } from "../../../../../utils/numberUtils";
import { Equipment } from "../../../../../enums/Equipment";
import { getEnumValue } from "../../../../../utils/globalHelper";
import { Mode } from "../../../../../enums/Mode";
import { LoadOption } from "../../../../../enums/LoadOption";
import { Commodity } from "../../../../../enums/Commodity";

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
        { label: "Origin", value: load.origin?.str || "N/A", fullWidth: true },
        {
          label: "Pick-Up",
          value: load.originEarlyPickupDate
            ? formatDate(load.originEarlyPickupDate, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Pick-Up Time",
          value: load.originEarlyPickupTime
            ? formatDate(load.originEarlyPickupTime, "h:mm aa")
            : "N/A",
        },
        {
          label: "Miles",
          value: load.miles ? `${formatNumber(load.miles)} mi` : "N/A",
        },
      ],
    },
    {
      heading: "DESTINATION",
      rows: [
        {
          label: "Destination",
          value: load.destination?.str || "N/A",
          fullWidth: true
        },
        {
          label: "Early Drop-off Date",
          value: load.destinationEarlyDropoffDate
            ? formatDate(load.destinationEarlyDropoffDate, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Early Drop-off Time",
          value: load.destinationEarlyDropoffTime
            ? formatDate(load.destinationEarlyDropoffTime, "h:mm aa")
            : "N/A",
        },
        {
          label: "Late Drop-off Date",
          value: load.destinationLateDropoffDate
            ? formatDate(load.destinationLateDropoffDate, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Late Drop-off Time",
          value: load.destinationLateDropoffTime
            ? formatDate(load.destinationLateDropoffTime, "h:mm aa")
            : "N/A",
        },
      ],
    },
    {
      heading: "MORE DETAILS",
      rows: [
        {
          label: "Load Number",
          value: load.loadNumber ? load.loadNumber : "N/A",
        },
        {
          label: "Equipment",
          value: getEnumValue(Equipment, load.equipment),
        },
        { label: "Mode", value: getEnumValue(Mode, load.mode as string) },
        {
          label: "Broker Rate",
          value: load.allInRate ? `$ ${formatNumber(load.allInRate)}` : "N/A",
        },
        {
          label: "Weight",
          value: load.weight ? load.weight + 'lbs' : "N/A",
        },
        {
          label: "Length",
          value: load.length ? load.length + 'ft' : "N/A",
        },
        {
          label: "Width",
          value: load.width ? load.width + 'ft' : "N/A",
        },
        {
          label: "Height",
          value: load.height ? load.height + 'ft' : "N/A",
        },
        {
          label: "Distance (Miles)",
          value: load.miles ? load.miles + 'mi' : "N/A",
        },
        {
          label: "Pieces",
          value: load.pieces ? load.pieces + 'pieces' : "N/A",
        },
        {
          label: "Pallets",
          value: load.pallets ? load.pallets + 'pallets' : "N/A",
        },
        { label: "Load Option", value: getEnumValue(LoadOption, load.mode as string) },
        { label: "Commodity", value: getEnumValue(Commodity, load.commodity) },
        {
          label: "Posted By",
          value: (load.postedBy as User)?.company + ' (' + (load.postedBy as User)?.email + ')',
        },
        { label: "Special Info", value: load.specialInstructions || "N/A", fullWidth: true },
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
