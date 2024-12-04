import React from "react";
import { Load } from "../../../../../types/Load";

const LoadDetailsModal: React.FC<{
  isOpen: boolean;
  load: Partial<Load> | null;
  onClose: () => void;
}> = ({ isOpen, load, onClose }) => {
  if (!load) return null;

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
                <strong>Load Details</strong>
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <h5 className="modal-heading mb-1">ORIGIN</h5>
              <div className="details-group">
                <DetailsRow label="Name" value={`${load.origin}`} />

                <DetailsRow
                  label="Early Pick-Up Date "
                  value={String(load.originEarlyPickupDate || "N/A")}
                />

                <DetailsRow
                  label="Early Pick-Up Time"
                  value={String(load.originEarlyPickupTime || "N/A")}
                />

                <DetailsRow
                  label="Late Pick-Up Date "
                  value={String(load.originLatePickupDate || "N/A")}
                />

                <DetailsRow
                  label="Late Pick-Up Time"
                  value={String(load.originLatePickupTime || "N/A")}
                />
              </div>

              {/* Destination Details*/}
              <h5 className="modal-heading mt-2 mb-1">Destination</h5>
              <div className="details-group">
                <DetailsRow
                  label="Destination"
                  value={load.destination || "N/A"}
                />

                <DetailsRow
                  label="Early Drop-off Date"
                  value={String(load.destinationEarlyDropoffDate || "N/A")}
                  fullWidth={true}
                />

                <DetailsRow
                  label="Early Drop-off Time"
                  value={String(load.destinationEarlyDropoffTime || "N/A")}
                  fullWidth={true}
                />

                <DetailsRow
                  label="Late Drop-off Date"
                  value={String(load.destinationLateDropoffDate || "N/A")}
                />
                <DetailsRow
                  label="Late Drop-off Time"
                  value={String(load.destinationLateDropoffTime || "N/A")}
                />
              </div>

              {/* More Details */}
              <h5 className="modal-heading mt-2 mb-1">More Details</h5>
              <div className="details-group">
                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Equipment"
                      value={load.equipment || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Mode"
                      value={String(load.mode || "N/A")}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Broker Rate"
                      value={load.allInRate || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="All-in Rate"
                      value={load.customerRate || "N/A"}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Weight" value={load.weight || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Length" value={load.length || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Width" value={load.width || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Height" value={load.height || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Distance"
                      value={load.distance || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Pieces" value={load.pieces || "N/A"} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow label="Pallets" value={load.pallets || "N/A"} />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Load Option"
                      value={load.loadOption || "N/A"}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Commodity"
                      value={load.commodity || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Load Number"
                      value={load.loadNumber || "N/A"}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Assign User"
                      value={load.postedBy || "N/A"}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DetailsRow
                      label="Special Info"
                      value={load.specialInstructions || "N/A"}
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

export default LoadDetailsModal;
