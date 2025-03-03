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
  load?: Partial<Load>;
  onClose: () => void;
}> = ({ isOpen, load, onClose }) => {
  if (!load) return null;

  const details = [
    {
      heading: "ORIGIN",
      rows: [
        { label: "Name", value: load.origin?.str || "N/A", fullWidth: true },
        {
          label: "Early Pick-Up Date",
          value: load.originEarlyPickupDate
            ? formatDate(load.originEarlyPickupDate, "MM/dd/yyyy")
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Early Pick-Up Time",
          value: load.originEarlyPickupTime
            ? formatDate(load.originEarlyPickupTime, "h:mm aa")
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Late Pick-Up Date",
          value: load.originLatePickupDate
            ? formatDate(load.originLatePickupDate, "MM/dd/yyyy")
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Late Pick-Up Time",
          value: load.originLatePickupTime
            ? formatDate(load.originLatePickupTime, "h:mm aa")
            : "N/A",
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
            ? formatDate(load.destinationEarlyDropoffDate, "MM/dd/yyyy")
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Early Drop-off Time",
          value: load.destinationEarlyDropoffTime
            ? formatDate(load.destinationEarlyDropoffTime, "h:mm aa")
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Late Drop-off Date",
          value: load.destinationLateDropoffDate
            ? formatDate(load.destinationLateDropoffDate, "MM/dd/yyyy")
            : "N/A",
          fullWidth: true,
        },
        {
          label: "Late Drop-off Time",
          value: load.destinationLateDropoffTime
            ? formatDate(load.destinationLateDropoffTime, "h:mm aa")
            : "N/A",
          fullWidth: true,
        },
      ],
    },
    {
      heading: "MORE DETAILS",
      rows: [
              { label: "Equipment", value: getEnumValue(Equipment, load.equipment) },
        
        { label: "Mode", value: getEnumValue(Mode, load.mode) },
        {
          label: "Broker Rate",
          value: load.allInRate ? `$ ${formatNumber(load.allInRate)}` : "N/A",
        },
        {
          label: "Customer Rate",
          value: load.customerRate
            ? `$ ${formatNumber(load.customerRate)}`
            : "N/A",
        },
        {
          label: "Weight",
          value: load.weight ? `${formatNumber(load.weight)} lbs` : "N/A",
        },
        {
          label: "Length",
          value: load.length ? `${formatNumber(load.length)} ft` : "N/A",
        },
        {
          label: "Width",
          value: load.width ? `${formatNumber(load.width)} ft` : "N/A",
        },
        {
          label: "Height",
          value: load.height ? `${formatNumber(load.height)} ft` : "N/A",
        },
        {
          label: "Distance (Miles)",
          value: load.miles ? `${formatNumber(load.miles)} mi` : "N/A",
        },
        {
          label: "Pieces",
          value: load.pieces ? `${formatNumber(load.pieces)}` : "N/A",
        },
        {
          label: "Pallets",
          value: load.pallets ? `${formatNumber(load.pallets)}` : "N/A",
        },
        { label: "Load Option", value: getEnumValue(LoadOption, load.mode) },
        { label: "Commodity", value: getEnumValue(Commodity, load.commodity) },
        {
          label: "Load Number",
          value: load.loadNumber ? `${formatNumber(+load.loadNumber)}` : "N/A",
        },
        {
          label: "Assign User",
          value: (load.postedBy as User)?.company || "N/A",
        },
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
