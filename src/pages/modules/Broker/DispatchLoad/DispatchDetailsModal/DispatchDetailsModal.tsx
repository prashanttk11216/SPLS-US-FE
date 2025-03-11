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
  const [documents, setDocuments] = React.useState<any[] | undefined>(dispatch.documents);

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
      setDocuments((prevData: any[] | undefined) => {
        if (!prevData) return undefined;
        return updatedDocuments;
      });
    }
  }

  const details = [
    {
      heading: "BASIC DETAILS",
      rows: [
        { label: "Age", value: dispatch?.formattedAge || "N/A" },
        { label: "W/O", value: dispatch?.WONumber || "N/A" },
        { label: "Origin", value: dispatch?.shipper?.address?.str || "N/A" },
        {
          label: "Destination",
          value: dispatch?.consignee?.address?.str || "N/A",
        },
        {
          label: "Ship Date",
          value: dispatch?.shipper?.date
            ? formatDate(dispatch?.shipper.date, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Del Date",
          value: dispatch?.consignee?.date
            ? formatDate(dispatch?.consignee.date, "yyyy/MM/dd")
            : "N/A",
        },
        {
          label: "Equipment",
          value: getEnumValue(Equipment, dispatch?.equipment),
        },
        {
          label: "All-in Rate",
          value:
            (dispatch?.allInRate && `$ ${formatNumber(dispatch?.allInRate)}`) ||
            "N/A",
        },
        { label: "Load/Reference Number", value: dispatch?.loadNumber || "N/A" },
        {
          label: "Assign User",
          value: (dispatch?.postedBy as User)?.email || "N/A",
        },
      ],
    },
    {
      heading: "Shipper",
      rows: [
        {
          label: "Type",
          value: dispatch?.shipper?.type  || "N/A",
        },
        {
          label: "Quantity",
          value: dispatch?.shipper?.qty || "N/A",
        },
        {
          label: "Weight",
          value:  `${dispatch?.shipper?.weight || 0} lbs`
        },
        {
          label: "Value",
          value:  `$ ${dispatch?.shipper?.value || 0.00}`
        },
        {
          label: "P/O Number",
          value: dispatch?.shipper?.PO || "N/A", 
            
        },
        {
          label: "Shipping Notes",
          value: dispatch?.shipper?.notes || "N/A",
        },
      ],
    },

    {
      heading: "Consignee",
      rows: [
        {
          label: "Type",
          value: dispatch?.consignee?.type || "N/A",
        },
        {
          label: "Quantity",
          value: dispatch?.consignee?.qty || "N/A",
        },
        {
          label: "Weight",
          value:  `${dispatch?.consignee?.weight || 0} lbs`
        },
        {
          label: "Value",
          value:  `$ ${dispatch?.consignee?.value || 0.00}`
        },
        {
          label: "P/O Number",
          value: dispatch?.consignee?.PO || "N/A", 
        },
        {
          label: "Shipping Notes",
          value: dispatch?.consignee?.notes || "N/A",  
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
      documents={documents ? documents : []}
      handleRemoveDocument={removeDocument}
    />
  );  
};

export default DispatchDetailsModal;
