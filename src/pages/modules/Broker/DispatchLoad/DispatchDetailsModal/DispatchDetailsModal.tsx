import React from "react";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { IDispatch } from "../../../../../types/Dispatch";
import { formatDate } from "../../../../../utils/dateFormat";
import { User } from "../../../../../types/User";
import { formatNumber } from "../../../../../utils/numberUtils";
import { getEnumValue } from "../../../../../utils/globalHelper";
import { Equipment } from "../../../../../enums/Equipment";

const DispatchDetailsModal: React.FC<{
  isOpen: boolean;
  dispatch: Partial<IDispatch> | null;
  onClose: () => void;
}> = ({ isOpen, dispatch, onClose }) => {
  if (!dispatch) return null;

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        { label: "Age", value: dispatch.formattedAge || "N/A" },
        { label: "W/O", value: dispatch.WONumber || "N/A" },
        { label: "Origin", value: dispatch.shipper?.address?.str || "N/A" },
        {
          label: "Destination",
          value: dispatch.consignee?.address?.str || "N/A",
        },
        {
          label: "Ship Date",
          value: dispatch.shipper?.date
            ? formatDate(dispatch.shipper.date, "MM/dd/yyyy")
            : "N/A",
        },
        {
          label: "Del Date",
          value: dispatch.consignee?.date
            ? formatDate(dispatch.consignee.date, "MM/dd/yyyy")
            : "N/A",
        },
        {
          label: "Equipment",
          value: getEnumValue(Equipment, dispatch.equipment),
        },
        {
          label: "All-in Rate",
          value:
            (dispatch.allInRate && `$ ${formatNumber(dispatch.allInRate)}`) ||
            "N/A",
        },
        { label: "Load/Reference Number", value: dispatch.loadNumber || "N/A" },
        {
          label: "Assign User",
          value: (dispatch.postedBy as User)?.email || "N/A",
        },
      ],
    },
    {
      heading: "Shipper",
      rows: [
        {
          label: "Type",
          value: getEnumValue(Equipment, dispatch.shipper?.type),
        },
        {
          label: "Quantity",
          value:
            (dispatch.shipper?.qty &&
              `${formatNumber(dispatch.shipper.qty)}`) ||
            "N/A",
        },
        {
          label: "Weight",
          value:
            (dispatch.shipper?.weight &&
              `${formatNumber(dispatch.shipper.weight)} lbs`) ||
            "N/A",
        },
        {
          label: "Value",
          value:
            (dispatch.shipper?.value &&
              `$ ${formatNumber(dispatch.shipper.value)}`) ||
            "N/A",
        },
        {
          label: "P/O Number",
          value:
            (dispatch.shipper?.PO && `${formatNumber(dispatch.shipper.PO)}`) ||
            "N/A",
        },
        {
          label: "Shipping Notes",
          value: dispatch.shipper?.notes || "N/A",
        },
      ],
    },

    {
      heading: "Consignee",
      rows: [
        {
          label: "Type",
          value: getEnumValue(Equipment, dispatch.consignee?.type),
        },
        {
          label: "Quantity",
          value:
            (dispatch.consignee?.qty &&
              `${formatNumber(dispatch.consignee.qty)}`) ||
            "N/A",
        },
        {
          label: "Weight",
          value:
            (dispatch.consignee?.weight &&
              `${formatNumber(dispatch.consignee.weight)} lbs`) ||
            "N/A",
        },
        {
          label: "Value",
          value:
            (dispatch.consignee?.value &&
              `$ ${formatNumber(dispatch.consignee.value)}`) ||
            "N/A",
        },
        {
          label: "P/O Number",
          value:
            (dispatch.consignee?.PO &&
              `${formatNumber(dispatch.consignee.PO)}`) ||
            "N/A",
        },
        {
          label: "Shipping Notes",
          value: dispatch.consignee?.notes || "N/A",
        },
      ],
    },
  ];

  return (
    <DetailsModal
      isOpen={isOpen}
      title="Dispatch Details"
      onClose={onClose}
      details={details}
      documents={dispatch.documents ? dispatch.documents : []}
    />
  );  
};

export default DispatchDetailsModal;
