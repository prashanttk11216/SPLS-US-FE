import React from "react";
import { User } from "../../../../../types/User";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

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

  const DetailsRow: React.FC<{
    label: string;
    value: string;
    fullWidth?: boolean;
  }> = ({ label, value, fullWidth }) => (
    <div className={`details-row ${fullWidth ? "full-width" : ""}`}>
      <span className="details-label">{label}:</span>
      <span className="details-value">: {value}</span>
    </div>
  );

  return (
    <div className="detailsModal-wrapper">
      <div
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="title">
                <strong>Customer Details</strong>
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <h5 className="modal-heading mb-1">BASIC DETAILS</h5>
              <div className="details-group">
                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Name"
                      value={`${customer.firstName} ${customer.lastName}`}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Email" value={customer.email || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Contact"
                      value={formatPhoneNumber(customer.primaryNumber)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Company"
                      value={customer.company || "N/A"}
                    />
                  </div>
                </div>
              </div>

              <h5 className="modal-heading mt-2 mb-1">MAILING ADDRESS</h5>
              <div className="details-group">
                <DetailsRow
                  label="Address"
                  value={customer.address || "N/A"}
                  fullWidth={true}
                />
                <DetailsRow
                  label="Address Line 2"
                  value={customer.addressLine2 || "N/A"}
                  fullWidth={true}
                />
                <DetailsRow
                  label="Address Line 3"
                  value={customer.addressLine3 || "N/A"}
                  fullWidth={true}
                />

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="City" value={customer.city || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Zip" value={customer.zip || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="State" value={customer.state || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Country"
                      value={customer.country || "N/A"}
                    />
                  </div>
                </div>

                <h5 className="modal-heading mt-2 mb-1">BILLING ADDRESS</h5>
                <div className="details-group">
                  <DetailsRow
                    label="Address"
                    value={customer.billingAddress || "N/A"}
                    fullWidth={true}
                  />
                </div>

                <div className="details-group">
                  <DetailsRow
                    label="Address Line 2"
                    value={customer.billingAddressLine2 || "N/A"}
                    fullWidth={true}
                  />
                </div>

                <div className="details-group">
                  <DetailsRow
                    label="Address Line 3"
                    value={customer.billingAddressLine3 || "N/A"}
                    fullWidth={true}
                  />
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="City"
                      value={customer.billingCity || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Zip"
                      value={customer.billingZip || "N/A"}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="State"
                      value={customer.billingState || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Country"
                      value={customer.billingCountry || "N/A"}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
