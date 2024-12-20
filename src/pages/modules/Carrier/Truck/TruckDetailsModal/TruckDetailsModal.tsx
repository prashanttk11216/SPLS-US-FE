import React from "react";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import DetailsModal from "../../../../../components/common/DetailsModal/DetailsModal";
import { Truck } from "../../../../../types/Truck";

const TruckDetailsModal: React.FC<{
  isOpen: boolean;
  truckData: Partial<Truck> | null;
  onClose: () => void;
}> = ({ isOpen, truckData, onClose }) => {
  if (!truckData) return null;

  // const formatPhoneNumber = (phoneNumber: string | undefined): string => {
  //   if (!phoneNumber) return "N/A";

  //   try {
  //     const phoneUtil = PhoneNumberUtil.getInstance();
  //     const number = phoneUtil.parse(phoneNumber, "US");
  //     return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
  //   } catch {
  //     return phoneNumber;
  //   }
  // };

  // const details = [
  //   {
  //     heading: "BASIC DETAILS",
  //     rows: [
  //       {
  //         label: "Name",
  //         value: `${truckData.firstName || ""} ${truckData.lastName || ""}`,
  //       },
  //       { label: "Email", value: truckData.email || "N/A" },
  //       { label: "Contact", value: formatPhoneNumber(truckData.primaryNumber) },
  //       { label: "Shipping Hours", value: truckData.shippingHours || "N/A" },
  //     ],
  //   },
  //   {
  //     heading: "ADDRESS",
  //     rows: [
  //       {
  //         label: "Address",
  //         value: truckData.address || "N/A",
  //         fullWidth: true,
  //       },
  //       {
  //         label: "Address Line 2",
  //         value: truckData.addressLine2 || "N/A",
  //         fullWidth: true,
  //       },
  //       {
  //         label: "Address Line 3",
  //         value: truckData.addressLine3 || "N/A",
  //         fullWidth: true,
  //       },
  //       { label: "City", value: truckData.city || "N/A" },
  //       { label: "Zip", value: truckData.zip || "N/A" },
  //       { label: "State", value: truckData.state || "N/A" },
  //       { label: "Country", value: truckData.country || "N/A" },
  //     ],
  //   },
  // ];

  // return (
  //   // <DetailsModal
  //   //   isOpen={isOpen}
  //   //   title="Consignee Details"
  //   //   onClose={onClose}
  //   //   details={details}
  //   // />
  // );
};

export default TruckDetailsModal;
