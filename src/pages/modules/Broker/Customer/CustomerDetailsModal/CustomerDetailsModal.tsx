import React from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { User } from "../../../../../types/User";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

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

const CustomerDetailsModal: React.FC<{
  isOpen: boolean;
  customer: Partial<User> | null;
  onClose: () => void;
}> = ({ isOpen, customer, onClose }) => {
  if (!customer) return null;

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
        title="Customer Details"
        size="lg"
        isCentered={true}
      >
        {/* Basic Details */}
        {renderDetailsGroup(
          "BASIC DETAILS",
          [
            {
              label: "Name",
              value: `${customer.firstName || ""} ${customer.lastName || ""}`,
            },
            { label: "Email", value: customer.email || "N/A" },
            {
              label: "Contact",
              value: formatPhoneNumber(customer.primaryNumber),
            },
            { label: "Company", value: customer.company || "N/A" },
          ],
          "col-12 col-md-6" // Half-width columns for basic details
        )}

        {/* Mailing Address */}
        {renderDetailsGroup(
          "MAILING ADDRESS",
          [
            {
              label: "Address",
              value: customer.address || "N/A",
              fullWidth: true,
            },
            {
              label: "Address Line 2",
              value: customer.addressLine2 || "N/A",
              fullWidth: true,
            },
            {
              label: "Address Line 3",
              value: customer.addressLine3 || "N/A",
              fullWidth: true,
            },
            { label: "City", value: customer.city || "N/A" },
            { label: "Zip", value: customer.zip || "N/A" },
            { label: "State", value: customer.state || "N/A" },
            { label: "Country", value: customer.country || "N/A" },
          ],
          "col-12 col-md-6" // Half-width columns for mailing address
        )}

        {/* Billing Address */}
        {renderDetailsGroup(
          "BILLING ADDRESS",
          [
            {
              label: "Address",
              value: customer.billingAddress || "N/A",
              fullWidth: true,
            },
            {
              label: "Address Line 2",
              value: customer.billingAddressLine2 || "N/A",
              fullWidth: true,
            },
            {
              label: "Address Line 3",
              value: customer.billingAddressLine3 || "N/A",
              fullWidth: true,
            },
            { label: "City", value: customer.billingCity || "N/A" },
            { label: "Zip", value: customer.billingZip || "N/A" },
            { label: "State", value: customer.billingState || "N/A" },
            { label: "Country", value: customer.billingCountry || "N/A" },
          ],
          "col-12 col-md-6" // Half-width columns for billing address
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

export default CustomerDetailsModal;
