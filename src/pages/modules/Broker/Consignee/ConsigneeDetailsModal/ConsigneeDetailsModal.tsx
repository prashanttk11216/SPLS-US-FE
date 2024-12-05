import React from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import { Consignee } from "../../../../../types/Consignee";

const DetailsRow: React.FC<{
  label: string;
  value: string | number;
  fullWidth?: boolean;
}> = ({ label, value, fullWidth }) => (
  <div className={`details-row ${fullWidth ? "full-width" : ""}`}>
    <span className="details-label">{label}</span>
    <span className="details-value">: {value}</span>
  </div>
);

const ConsigneeDetailsModal: React.FC<{
  isOpen: boolean;
  consignee: Partial<Consignee> | null;
  onClose: () => void;
}> = ({ isOpen, consignee, onClose }) => {
  if (!consignee) return null;

  const formatPhoneNumber = (phoneNumber: string | undefined): string => {
    if (!phoneNumber) return "N/A";

    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const number = phoneUtil.parse(phoneNumber, "US");
      return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
    } catch {
      return phoneNumber;
    }
  };

  const renderDetailsGroup = (
    heading: string,
    rows: { label: string; value: string | number; fullWidth?: boolean }[],
    rowClassName: string
  ) => (
    <div>
      <h5 className="modal-heading mt-2 mb-1">{heading}</h5>
      <div className="details-group">
        <div className="row">
          {rows.map(({ label, value, fullWidth = false }, index) => (
            <div
              key={index}
              className={`${fullWidth ? "col-12" : rowClassName} mb-2`}
            >
              <DetailsRow label={label} value={value} fullWidth={fullWidth} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="detailsModal-wrapper">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Consignee Details"
        size="lg"
        isCentered={true}
      >
        {/* Basic Details */}
        {renderDetailsGroup(
          "BASIC DETAILS",
          [
            {
              label: "Name",
              value: `${consignee.firstName || ""} ${consignee.lastName || ""}`,
            },
            { label: "Email", value: consignee.email || "N/A" },
            {
              label: "Contact",
              value: formatPhoneNumber(consignee.primaryNumber),
            },
            {
              label: "Shipping Hours",
              value: consignee.shippingHours || "N/A",
            },
          ],
          "col-12 col-md-6" // Half-width columns for basic details
        )}

        {/* Address */}
        {renderDetailsGroup(
          "ADDRESS",
          [
            {
              label: "Address",
              value: consignee.address || "N/A",
              fullWidth: true,
            },
            {
              label: "Address Line 2",
              value: consignee.addressLine2 || "N/A",
              fullWidth: true,
            },
            {
              label: "Address Line 3",
              value: consignee.addressLine3 || "N/A",
              fullWidth: true,
            },
            { label: "City", value: consignee.city || "N/A" },
            { label: "Zip", value: consignee.zip || "N/A" },
            { label: "State", value: consignee.state || "N/A" },
            { label: "Country", value: consignee.country || "N/A" },
          ],
          "col-12 col-md-6" // Half-width columns for address
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ConsigneeDetailsModal;
