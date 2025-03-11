import React from "react";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { IDispatch } from "../../../../../types/Dispatch";
import { formatDate } from "../../../../../utils/dateFormat";
import { User } from "../../../../../types/User";
import { formatNumber } from "../../../../../utils/numberUtils";
import { getEnumValue } from "../../../../../utils/globalHelper";
import { Equipment } from "../../../../../enums/Equipment";
import useFetchData from "../../../../../hooks/useFetchData/useFetchData";
import { deleteDocument } from "../../../../../services/upload/uploadServices";
import { toast } from "react-toastify";

const DispatchDetailsModal: React.FC<{
  isOpen: boolean;
  dispatch: Partial<IDispatch> | null;
  onClose: () => void;
}> = ({ isOpen, dispatch, onClose }) => {
  if (!dispatch) return null;
  const [dispatchData, setDispatchData] = React.useState<IDispatch | null>(dispatch as IDispatch);

  const {updateData} = useFetchData<any>({
    update: {
      updateDocument: deleteDocument,
    },
  });
  const removeDocument = async (file: any) => {
    const result = await updateData("updateDocument", dispatch._id as string, file);
    if (result.success) {
      toast.success("Document deleted successfully");
      const updatedDocuments = dispatch.documents?.filter((doc) => doc.filename !== file);
      dispatch.documents = updatedDocuments
      setDispatchData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          documents: updatedDocuments
        } as IDispatch;
      });
    }
  }

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        { label: "Age", value: dispatchData?.formattedAge || "N/A" },
        { label: "W/O", value: dispatchData?.WONumber || "N/A" },
        { label: "Origin", value: dispatchData?.shipper?.address?.str || "N/A" },
        {
          label: "Destination",
          value: dispatchData?.consignee?.address?.str || "N/A",
        },
        {
          label: "Ship Date",
          value: dispatchData?.shipper?.date
            ? formatDate(dispatchData?.shipper.date, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Del Date",
          value: dispatchData?.consignee?.date
            ? formatDate(dispatchData?.consignee.date, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Equipment",
          value: getEnumValue(Equipment, dispatchData?.equipment),
        },
        {
          label: "All-in Rate",
          value:
            (dispatchData?.allInRate && `$ ${formatNumber(dispatchData?.allInRate)}`) ||
            "N/A",
        },
        { label: "Load/Reference Number", value: dispatchData?.loadNumber || "N/A" },
        {
          label: "Assign User",
          value: (dispatchData?.postedBy as User)?.email || "N/A",
        },
      ],
    },
    {
      heading: "Shipper",
      rows: [
        {
          label: "Type",
          value: dispatchData?.shipper?.type  || "N/A",
        },
        {
          label: "Quantity",
          value: dispatchData?.shipper?.qty || "N/A",
        },
        {
          label: "Weight",
          value:  `${dispatchData?.shipper?.weight || 0} lbs`
        },
        {
          label: "Value",
          value:  `$ ${dispatchData?.shipper?.value || 0.00}`
        },
        {
          label: "P/O Number",
          value: dispatchData?.shipper?.PO || "N/A", 
            
        },
        {
          label: "Shipping Notes",
          value: dispatchData?.shipper?.notes || "N/A",
        },
      ],
    },

    {
      heading: "Consignee",
      rows: [
        {
          label: "Type",
          value: dispatchData?.consignee?.type || "N/A",
        },
        {
          label: "Quantity",
          value: dispatchData?.consignee?.qty || "N/A",
        },
        {
          label: "Weight",
          value:  `${dispatchData?.consignee?.weight || 0} lbs`
        },
        {
          label: "Value",
          value:  `$ ${dispatchData?.consignee?.value || 0.00}`
        },
        {
          label: "P/O Number",
          value: dispatchData?.consignee?.PO || "N/A", 
        },
        {
          label: "Shipping Notes",
          value: dispatchData?.consignee?.notes || "N/A",  
        },
      ],
    },
  ];
  console.log(dispatchData);
  return (
    <DetailsModal
      isOpen={isOpen}
      title="Dispatch Details"
      onClose={onClose}
      details={details}
      documents={dispatchData?.documents ? dispatchData?.documents : []}
      handleRemoveDocument={removeDocument}
    />
  );  
};

export default DispatchDetailsModal;
