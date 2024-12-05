import React from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import { Load } from "../../../../../types/Load";

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

const LoadDetailsModal: React.FC<{
  isOpen: boolean;
  load: Partial<Load> | null;
  onClose: () => void;
}> = ({ isOpen, load, onClose }) => {
  if (!load) return null;

  const renderDetailsGroup = (
    heading: string,
    rows: { label: string; value: string | number; fullWidth?: boolean }[],
    rowClassName: string // New parameter for custom row class
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
        title="Load Details"
        size="lg"
        isCentered={true}
      >
        {/* Origin Details */}
        {renderDetailsGroup(
          "ORIGIN",
          [
            { label: "Name", value: load.origin || "N/A" },
            {
              label: "Early Pick-Up Date",
              value: String(load.originEarlyPickupDate || "N/A"),
            },
            {
              label: "Early Pick-Up Time",
              value: String(load.originEarlyPickupTime || "N/A"),
            },
            {
              label: "Late Pick-Up Date",
              value: String(load.originLatePickupDate || "N/A"),
            },
            {
              label: "Late Pick-Up Time",
              value: String(load.originLatePickupTime || "N/A"),
            },
          ],
          "col-12" // Full width for Origin details
        )}

        {/* Destination Details */}
        {renderDetailsGroup(
          "Destination",
          [
            { label: "Destination", value: load.destination || "N/A" },
            {
              label: "Early Drop-off Date",
              value: String(load.destinationEarlyDropoffDate || "N/A"),
              fullWidth: true,
            },
            {
              label: "Early Drop-off Time",
              value: String(load.destinationEarlyDropoffTime || "N/A"),
              fullWidth: true,
            },
            {
              label: "Late Drop-off Date",
              value: String(load.destinationLateDropoffDate || "N/A"),
            },
            {
              label: "Late Drop-off Time",
              value: String(load.destinationLateDropoffTime || "N/A"),
            },
          ],
          "col-12" // Full width for Destination details
        )}

        {/* More Details */}
        {renderDetailsGroup(
          "More Details",
          [
            { label: "Equipment", value: load.equipment || "N/A" },
            { label: "Mode", value: load.mode || "N/A" },
            { label: "Broker Rate", value: load.allInRate || "N/A" },
            { label: "All-in Rate", value: load.customerRate || "N/A" },
            { label: "Weight", value: load.weight || "N/A" },
            { label: "Length", value: load.length || "N/A" },
            { label: "Width", value: load.width || "N/A" },
            { label: "Height", value: load.height || "N/A" },
            { label: "Distance", value: load.distance || "N/A" },
            { label: "Pieces", value: load.pieces || "N/A" },
            { label: "Pallets", value: load.pallets || "N/A" },
            { label: "Load Option", value: load.loadOption || "N/A" },
            { label: "Commodity", value: load.commodity || "N/A" },
            { label: "Load Number", value: load.loadNumber || "N/A" },
            { label: "Assign User", value: load.postedBy || "N/A" },
            { label: "Special Info", value: load.specialInstructions || "N/A" },
          ],
          "col-12 col-md-6" // Half-width for More Details
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

export default LoadDetailsModal;
