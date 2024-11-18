import React, { FC, ReactNode } from "react";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback for closing the modal
  title?: string; // Modal header title
  children?: ReactNode; // Modal body content
  footer?: ReactNode; // Optional footer content
  size?: "sm" | "md" | "lg" | "xl"; // Modal size
  isCentered?: boolean; // Center the modal vertically
  backdropClose?: boolean; // Close modal on backdrop click
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  isCentered = true,
  backdropClose = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdropClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-dialog modal-${size} ${
          isCentered ? "modal-dialog-centered" : ""
        }`}
      >
        <div className="modal-content">
          {/* Header */}
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Body */}
          <div className="modal-body">{children}</div>

          {/* Footer */}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
