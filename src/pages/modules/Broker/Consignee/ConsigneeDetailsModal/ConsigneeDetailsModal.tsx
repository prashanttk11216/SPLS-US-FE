import React from "react";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import { Consignee } from "../../../../../types/Consignee";

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
                <strong>Consignee Details</strong>
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
                      value={`${consignee.firstName} ${consignee.lastName}`}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Email" value={consignee.email || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Contact"
                      value={formatPhoneNumber(consignee.primaryNumber)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Shipping Hours"
                      value={consignee.shippingHours || "N/A"}
                    />
                  </div>
                </div>
              </div>

              <h5 className="modal-heading mt-2 mb-1">ADDRESS</h5>
              <div className="details-group">
                <DetailsRow
                  label="Address"
                  value={consignee.address || "N/A"}
                  fullWidth={true}
                />
                <DetailsRow
                  label="Address Line 2"
                  value={consignee.addressLine2 || "N/A"}
                  fullWidth={true}
                />
                <DetailsRow
                  label="Address Line 3"
                  value={consignee.addressLine3 || "N/A"}
                  fullWidth={true}
                />

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="City" value={consignee.city || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Zip" value={consignee.zip || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="State" value={consignee.state || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Country"
                      value={consignee.country || "N/A"}
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

export default ConsigneeDetailsModal;
