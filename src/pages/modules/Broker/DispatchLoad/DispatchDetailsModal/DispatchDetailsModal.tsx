import React from "react";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { IDispatch } from "../../../../../types/Dispatch";
import { formatDate } from "../../../../../utils/dateFormat";
import { User } from "../../../../../types/User";

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
          value: dispatch.equipment || "N/A",
        },
        {
          label: "All-in Rate",
          value: (dispatch.allInRate && `${dispatch.allInRate} $`) || "N/A",
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
          value: dispatch.shipper?.type || "N/A",
        },
        {
          label: "Quantity",
          value: dispatch.shipper?.qty || "N/A",
        },
        {
          label: "Weight",
          value:
            (dispatch.shipper?.weight && dispatch.shipper?.weight + " lbs") ||
            "N/A",
        },
        {
          label: "Value",
          value:
            (dispatch.shipper?.value && `${dispatch.shipper?.value} $`) ||
            "N/A",
        },
        {
          label: "P/O Number",
          value: dispatch.shipper?.PO || "N/A",
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
          value: dispatch.consignee?.type || "N/A",
        },
        {
          label: "Quantity",
          value: dispatch.consignee?.qty || "N/A",
        },
        {
          label: "Weight",
          value:
            (dispatch.consignee?.weight &&
              dispatch.consignee?.weight + " lbs") ||
            "N/A",
        },
        {
          label: "Value",
          value:
            (dispatch.consignee?.value && `${dispatch.consignee?.value} $`) ||
            "N/A",
        },
        {
          label: "P/O Number",
          value: dispatch.consignee?.PO || "N/A",
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
    />
  );
};

export default DispatchDetailsModal;
