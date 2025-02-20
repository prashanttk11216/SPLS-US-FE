import React from "react";
import Modal from "../Modal/Modal";
import "./DetailsModal.scss";

interface DetailsGroupRow {
  label: string;
  value?: string | number;
  fullWidth?: boolean;
}

interface DetailsModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  details: {
    heading: string;
    rows: DetailsGroupRow[];
  }[];
  documents?: any[];
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  title,
  onClose,
  details,
  documents,
}) => (
  <div className="splsdetailsModal-wrapper">
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {details.map(({ heading, rows }, idx) => (
        <div key={idx}>
          <h5 className="splsModal-heading mt-2 mb-1">{heading}</h5>
          <div className="details-group">
            <div className="row">
              {rows.map(({ label, value, fullWidth = false }, index) => (
                <div
                  key={index}
                  className={`${fullWidth ? "col-12" : "col-12 col-md-6"} mb-2`}
                >
                  <div
                    className={`details-row ${fullWidth ? "full-width" : ""}`}
                  >
                    <span className="details-label">{label}</span>
                    <span className="details-value">: {value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {documents && documents.length > 0 && (
        <div>
          <h5 className="splsModal-heading mt-2 mb-1">Documents</h5>
          <div>
            {documents.map((doc, idx) => (
              <div key={idx}>
                <a
                  href={`${import.meta.env.VITE_SERVER_URL}/${doc.path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {doc.filename}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <br />
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  </div>
);

export default DetailsModal;
